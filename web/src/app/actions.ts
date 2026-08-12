"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { createSession, destroySession, getGuestSession, getOwnerSession } from "@/lib/session";
import { uid, nightsBetween, bookingCode, money, prettyDate, rangesOverlap, isoToday } from "@/lib/utils";
import { waLink, requestMessage, replyMessage } from "@/lib/whatsapp";
import { getBusyRanges, TAG_CONTENIDO, TAG_RESERVAS } from "@/lib/data";

export type State = { ok?: boolean; error?: string; message?: string; waUrl?: string; code?: string };

const one = async <T>(q: Promise<T[]>): Promise<T | null> => (await q)[0] ?? null;

/* ============================ AUTENTICACION ============================ */

const registerSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre completo"),
  email: z.string().trim().toLowerCase().email("Email invalido"),
  phone: z.string().trim().max(30).optional().default(""),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres"),
});

export async function registerAction(_prev: State, form: FormData): Promise<State> {
  const parsed = registerSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, phone, password } = parsed.data;

  const exists = await one(db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1));
  if (exists) return { error: "Ya existe una cuenta con ese email. Proba ingresar." };

  const id = uid();
  await db.insert(schema.users).values({
    id, name, email, phone: phone ?? "",
    passwordHash: bcrypt.hashSync(password, 10),
    role: "guest", createdAt: Date.now(),
  });

  await createSession({ id, name, email, role: "guest" }, "guest");
  redirect("/mi-cuenta");
}

export async function loginAction(_prev: State, form: FormData): Promise<State> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Completa email y contrasena" };

  const user = await one(db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1));
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return { error: "Email o contrasena incorrectos" };
  }
  if (user.role === "owner") {
    return { error: "Esa es la cuenta del propietario. Entra por el acceso del panel." };
  }
  await createSession({ id: user.id, name: user.name, email: user.email, role: "guest" }, "guest");
  redirect("/mi-cuenta");
}

/** Acceso exclusivo del propietario. Rechaza cuentas de huesped. */
export async function loginOwnerAction(_prev: State, form: FormData): Promise<State> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Completa email y contrasena" };

  const user = await one(db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1));
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return { error: "Email o contrasena incorrectos" };
  }
  if (user.role !== "owner") {
    return { error: "Esa cuenta es de huesped. Ingresa desde el acceso de huespedes." };
  }
  await createSession({ id: user.id, name: user.name, email: user.email, role: "owner" }, "owner");
  redirect("/panel");
}

/** Cierra la sesion de huesped. No toca la del propietario. */
export async function logoutAction() {
  await destroySession("guest");
  redirect("/");
}

/** Cierra la sesion del propietario. No toca la del huesped. */
export async function logoutOwnerAction() {
  await destroySession("owner");
  redirect("/propietario");
}

/* ============================== RESERVAS ============================== */

const bookingSchema = z.object({
  propertyId: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de entrada invalida"),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de salida invalida"),
  adults: z.coerce.number().int().min(1).max(30),
  children: z.coerce.number().int().min(0).max(30),
  phone: z.string().trim().max(30).optional().default(""),
  message: z.string().trim().max(1200).optional().default(""),
});

export async function createBookingAction(_prev: State, form: FormData): Promise<State> {
  const session = await getGuestSession();
  if (!session) return { error: "Necesitas una cuenta de huesped para solicitar la reserva.", code: "AUTH" };

  const parsed = bookingSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { propertyId, checkIn, checkOut, adults, children, phone, message } = parsed.data;

  const property = await one(db.select().from(schema.properties).where(eq(schema.properties.id, propertyId)).limit(1));
  if (!property) return { error: "Alojamiento no encontrado" };

  if (checkIn < isoToday()) return { error: "La fecha de entrada no puede ser anterior a hoy" };
  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1) return { error: "La salida tiene que ser posterior a la entrada" };
  if (nights < property.minNights) return { error: `La estadia minima es de ${property.minNights} noches` };
  if (adults + children > property.maxGuests) {
    return { error: `${property.name} admite hasta ${property.maxGuests} huespedes` };
  }

  const busy = await getBusyRanges(propertyId);
  if (busy.some((b) => rangesOverlap(checkIn, checkOut, b.from, b.to))) {
    return { error: "Esas fechas ya estan ocupadas. Proba con otras." };
  }

  const estimate = nights * property.basePrice + property.cleaningFee;
  const code = bookingCode();
  const now = Date.now();

  if (phone) {
    await db.update(schema.users).set({ phone }).where(eq(schema.users.id, session.id));
  }

  await db.insert(schema.bookings).values({
    id: uid(), code, propertyId, userId: session.id,
    guestName: session.name, guestEmail: session.email, guestPhone: phone ?? "",
    checkIn, checkOut, nights, adults, children, message: message ?? "",
    estimate, status: "pendiente", ownerReply: "", createdAt: now, updatedAt: now,
  });

  const setting = await one(db.select().from(schema.settings).where(eq(schema.settings.key, "whatsapp")).limit(1));
  const ownerPhone = setting?.value || process.env.NEXT_PUBLIC_WHATSAPP || "5491100000000";

  const text = requestMessage({
    code, property: property.name, name: session.name, phone: phone ?? "",
    checkIn: prettyDate(checkIn), checkOut: prettyDate(checkOut), nights, adults, children,
    estimate: money(estimate, property.currency), message: message ?? "",
  });

  revalidateTag(TAG_RESERVAS);
  revalidatePath("/mi-cuenta");
  revalidatePath("/panel");
  return { ok: true, code, waUrl: waLink(ownerPhone, text), message: "Solicitud registrada" };
}

export async function cancelBookingAction(formData: FormData) {
  const session = await getGuestSession();
  if (!session) throw new Error("No autorizado");
  const id = String(formData.get("id"));
  const b = await one(db.select().from(schema.bookings).where(eq(schema.bookings.id, id)).limit(1));
  if (!b || b.userId !== session.id) throw new Error("No autorizado");
  await db.update(schema.bookings).set({ status: "cancelada", updatedAt: Date.now() })
    .where(eq(schema.bookings.id, id));
  revalidateTag(TAG_RESERVAS);
  revalidatePath("/mi-cuenta");
  revalidatePath("/panel");
}

/* ====================== PANEL DEL PROPIETARIO ====================== */

async function assertOwner() {
  const s = await getOwnerSession();
  if (!s) throw new Error("No autorizado: falta sesion de propietario");
  return s;
}

export async function replyBookingAction(_prev: State, form: FormData): Promise<State> {
  await assertOwner();
  const id = String(form.get("id"));
  const status = String(form.get("status"));
  const reply = String(form.get("ownerReply") ?? "").slice(0, 1200);
  if (!["pendiente", "confirmada", "rechazada", "cancelada"].includes(status)) return { error: "Estado invalido" };

  const b = await one(db.select().from(schema.bookings).where(eq(schema.bookings.id, id)).limit(1));
  if (!b) return { error: "Reserva no encontrada" };

  if (status === "confirmada") {
    const busy = await getBusyRanges(b.propertyId);
    if (busy.some((x) => rangesOverlap(b.checkIn, b.checkOut, x.from, x.to))) {
      return { error: "Esas fechas ya estan confirmadas para otra reserva." };
    }
  }

  await db.update(schema.bookings).set({ status, ownerReply: reply, updatedAt: Date.now() })
    .where(eq(schema.bookings.id, id));

  const property = await one(db.select().from(schema.properties).where(eq(schema.properties.id, b.propertyId)).limit(1));
  const text = replyMessage({
    code: b.code, property: property?.name ?? "", name: b.guestName, status,
    checkIn: prettyDate(b.checkIn), checkOut: prettyDate(b.checkOut), reply,
  });

  revalidateTag(TAG_RESERVAS);
  revalidatePath("/panel");
  revalidatePath("/mi-cuenta");
  return {
    ok: true,
    message: `Reserva ${b.code} marcada como ${status}`,
    waUrl: b.guestPhone ? waLink(b.guestPhone, text) : undefined,
  };
}

export async function updatePropertyAction(_prev: State, form: FormData): Promise<State> {
  await assertOwner();
  const id = String(form.get("id"));
  const num = (k: string, d = 0) => { const v = Number(form.get(k)); return Number.isFinite(v) ? v : d; };
  await db.update(schema.properties).set({
    name: String(form.get("name") ?? ""),
    kind: String(form.get("kind") ?? "Casa"),
    tagline: String(form.get("tagline") ?? ""),
    description: String(form.get("description") ?? ""),
    address: String(form.get("address") ?? ""),
    lat: num("lat", -34.418), lng: num("lng", -58.579),
    sizeM2: num("sizeM2"), bedrooms: num("bedrooms", 1), bathrooms: num("bathrooms", 1),
    beds: num("beds", 1), maxGuests: num("maxGuests", 2),
    basePrice: num("basePrice"), highPrice: num("highPrice"), cleaningFee: num("cleaningFee"),
    minNights: num("minNights", 1), rating: num("rating"), reviews: num("reviews"),
    checkIn: String(form.get("checkIn") ?? ""), checkOut: String(form.get("checkOut") ?? ""),
    active: form.get("active") ? 1 : 0,
  }).where(eq(schema.properties.id, id));

  revalidateTag(TAG_CONTENIDO);
  revalidatePath("/", "layout");
  return { ok: true, message: "Cambios guardados" };
}

export async function addAmenityAction(form: FormData) {
  await assertOwner();
  const propertyId = String(form.get("propertyId"));
  const label = String(form.get("label") ?? "").trim();
  if (!label) return;
  await db.insert(schema.amenities).values({
    id: uid(), propertyId,
    category: String(form.get("category") ?? "Varios"),
    label, icon: String(form.get("icon") ?? "check"),
    featured: form.get("featured") ? 1 : 0, sortOrder: 999,
  });
  revalidateTag(TAG_CONTENIDO);
  revalidatePath("/", "layout");
}

export async function deleteAmenityAction(form: FormData) {
  await assertOwner();
  await db.delete(schema.amenities).where(eq(schema.amenities.id, String(form.get("id"))));
  revalidateTag(TAG_CONTENIDO);
  revalidatePath("/", "layout");
}

export async function deleteImageAction(form: FormData) {
  await assertOwner();
  await db.delete(schema.images).where(eq(schema.images.id, String(form.get("id"))));
  revalidateTag(TAG_CONTENIDO);
  revalidatePath("/", "layout");
}

export async function moveImageAction(form: FormData) {
  await assertOwner();
  const id = String(form.get("id"));
  const dir = Number(form.get("dir"));
  const img = await one(db.select().from(schema.images).where(eq(schema.images.id, id)).limit(1));
  if (!img) return;
  const list = (await db.select().from(schema.images).where(eq(schema.images.propertyId, img.propertyId)))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const i = list.findIndex((x) => x.id === id);
  const j = i + dir;
  if (j < 0 || j >= list.length) return;
  await db.update(schema.images).set({ sortOrder: list[j].sortOrder }).where(eq(schema.images.id, list[i].id));
  await db.update(schema.images).set({ sortOrder: list[i].sortOrder }).where(eq(schema.images.id, list[j].id));
  revalidateTag(TAG_CONTENIDO);
  revalidatePath("/", "layout");
}

export async function updateImageAltAction(form: FormData) {
  await assertOwner();
  await db.update(schema.images).set({ alt: String(form.get("alt") ?? "") })
    .where(eq(schema.images.id, String(form.get("id"))));
  revalidateTag(TAG_CONTENIDO);
  revalidatePath("/", "layout");
}

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const BUCKET = process.env.SUPABASE_BUCKET ?? "fotos";

/** Sube a Supabase Storage si hay credenciales; si no, escribe en public/uploads (dev). */
async function storeFile(file: File, name: string): Promise<string> {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (base && key) {
    const res = await fetch(`${base}/storage/v1/object/${BUCKET}/${name}`, {
      method: "POST",
      headers: {
        // sirve tanto para las service_role clasicas como para las nuevas sb_secret_
        Authorization: `Bearer ${key}`,
        apikey: key,
        "Content-Type": file.type,
        "cache-control": "public, max-age=31536000",
      },
      body: new Uint8Array(bytes),
    });
    if (!res.ok) throw new Error(`Storage ${res.status}: ${await res.text()}`);
    return `${base}/storage/v1/object/public/${BUCKET}/${name}`;
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), bytes);
  return `/uploads/${name}`;
}

export async function uploadImagesAction(_prev: State, form: FormData): Promise<State> {
  await assertOwner();
  const propertyId = String(form.get("propertyId"));
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { error: "Elegi al menos una imagen" };

  const existing = await db.select().from(schema.images).where(eq(schema.images.propertyId, propertyId));
  const max = existing.reduce((m, i) => Math.max(m, i.sortOrder), 0);

  let n = 0;
  const errors: string[] = [];
  for (const file of files) {
    if (!ALLOWED.has(file.type)) continue;
    if (file.size > 8 * 1024 * 1024) continue;
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    try {
      const url = await storeFile(file, `${uid()}.${ext}`);
      await db.insert(schema.images).values({
        id: uid(), propertyId, url,
        alt: String(form.get("alt") ?? "") || "Foto del alojamiento",
        sortOrder: max + ++n,
      });
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }
  if (!n) return { error: errors[0] ?? "Formato no permitido (JPG, PNG, WEBP o AVIF, hasta 8 MB)" };
  revalidateTag(TAG_CONTENIDO);
  revalidatePath("/", "layout");
  return { ok: true, message: `${n} imagen(es) subida(s)` };
}

export async function updateSettingsAction(_prev: State, form: FormData): Promise<State> {
  await assertOwner();
  for (const [key, value] of form.entries()) {
    if (typeof value !== "string") continue;
    await db.insert(schema.settings).values({ key, value })
      .onConflictDoUpdate({ target: schema.settings.key, set: { value } });
  }
  revalidateTag(TAG_CONTENIDO);
  revalidatePath("/", "layout");
  return { ok: true, message: "Contenido actualizado" };
}

export async function saveActivityAction(_prev: State, form: FormData): Promise<State> {
  await assertOwner();
  const id = String(form.get("id") ?? "");
  const values = {
    title: String(form.get("title") ?? ""),
    tag: String(form.get("tag") ?? ""),
    summary: String(form.get("summary") ?? ""),
    body: String(form.get("body") ?? ""),
    image: String(form.get("image") ?? ""),
    sortOrder: Number(form.get("sortOrder") ?? 99),
  };
  if (id) await db.update(schema.activities).set(values).where(eq(schema.activities.id, id));
  else await db.insert(schema.activities).values({ id: uid(), ...values });
  revalidateTag(TAG_CONTENIDO);
  revalidatePath("/", "layout");
  return { ok: true, message: "Experiencia guardada" };
}

export async function deleteActivityAction(form: FormData) {
  await assertOwner();
  await db.delete(schema.activities).where(eq(schema.activities.id, String(form.get("id"))));
  revalidateTag(TAG_CONTENIDO);
  revalidatePath("/", "layout");
}

export async function addBlockAction(form: FormData) {
  await assertOwner();
  const from = String(form.get("fromDate") ?? "");
  const to = String(form.get("toDate") ?? "");
  if (!from || !to || to <= from) return;
  await db.insert(schema.blocks).values({
    id: uid(), propertyId: String(form.get("propertyId")),
    fromDate: from, toDate: to, reason: String(form.get("reason") ?? "Bloqueo manual"),
  });
  revalidateTag(TAG_CONTENIDO);
  revalidatePath("/", "layout");
}

export async function deleteBlockAction(form: FormData) {
  await assertOwner();
  await db.delete(schema.blocks).where(eq(schema.blocks.id, String(form.get("id"))));
  revalidateTag(TAG_CONTENIDO);
  revalidatePath("/", "layout");
}
