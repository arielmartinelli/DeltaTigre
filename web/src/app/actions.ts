"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { createSession, destroySession, getOwnerSession } from "@/lib/session";
import { uid, nightsBetween, bookingCode, money, prettyDate, rangesOverlap, isoToday, quoteStay, daysBetween } from "@/lib/utils";
import { waLink, replyMessage } from "@/lib/whatsapp";
import { getBusyRanges, getRates, TAG_CONTENIDO, TAG_RESERVAS } from "@/lib/data";

export type State = { ok?: boolean; error?: string; message?: string; waUrl?: string; code?: string };

const one = async <T>(q: Promise<T[]>): Promise<T | null> => (await q)[0] ?? null;

/* ============================ AUTENTICACION ============================ */

/** Unico acceso del sistema: el propietario. */
export async function loginOwnerAction(_prev: State, form: FormData): Promise<State> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const recordar = !!form.get("recordar");
  if (!email || !password) return { error: "Completá email y contraseña" };

  const user = await one(db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1));
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return { error: "Email o contraseña incorrectos" };
  }
  if (user.role !== "owner") return { error: "Esa cuenta no tiene acceso al panel" };

  await createSession({ id: user.id, name: user.name, email: user.email, role: "owner" }, recordar);
  redirect("/panel");
}

export async function logoutOwnerAction() {
  await destroySession();
  redirect("/propietario");
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

/* ============ RESERVAS MANUALES (las carga el propietario) ============ */

const manualSchema = z.object({
  propertyId: z.string().min(1),
  guestName: z.string().trim().min(2, "Ingresá el nombre del huésped"),
  guestPhone: z.string().trim().max(30).optional().default(""),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de entrada inválida"),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de salida inválida"),
  adults: z.coerce.number().int().min(1).max(40),
  children: z.coerce.number().int().min(0).max(40),
  estimate: z.coerce.number().int().min(0).optional().default(0),
  message: z.string().trim().max(1200).optional().default(""),
  status: z.string().optional().default("confirmada"),
});

/**
 * Carga una reserva a mano. Si queda confirmada, esas fechas se cierran
 * automaticamente en el calendario publico.
 */
export async function createManualBookingAction(_prev: State, form: FormData): Promise<State> {
  const owner = await assertOwner();

  const parsed = manualSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  const property = await one(db.select().from(schema.properties).where(eq(schema.properties.id, d.propertyId)).limit(1));
  if (!property) return { error: "Alojamiento no encontrado" };

  const nights = nightsBetween(d.checkIn, d.checkOut);
  if (nights < 1) return { error: "La salida tiene que ser posterior a la entrada" };

  const status = ["pendiente", "confirmada", "rechazada", "cancelada"].includes(d.status) ? d.status : "confirmada";

  if (status === "confirmada") {
    const busy = await getBusyRanges(d.propertyId);
    if (busy.some((b) => rangesOverlap(d.checkIn, d.checkOut, b.from, b.to))) {
      return { error: "Esas fechas se superponen con otra reserva confirmada o un bloqueo" };
    }
  }

  // Si no se indica monto, se calcula con las tarifas por dia
  let estimate = d.estimate;
  if (!estimate) {
    const rates = await getRates(d.propertyId);
    estimate = quoteStay(d.checkIn, d.checkOut, property.basePrice, rates, property.cleaningFee).total;
  }

  const now = Date.now();
  await db.insert(schema.bookings).values({
    id: uid(), code: bookingCode(), propertyId: d.propertyId, userId: owner.id,
    guestName: d.guestName, guestEmail: "", guestPhone: d.guestPhone ?? "",
    checkIn: d.checkIn, checkOut: d.checkOut, nights,
    adults: d.adults, children: d.children, message: d.message ?? "",
    estimate, status, ownerReply: "", createdAt: now, updatedAt: now,
  });

  revalidateTag(TAG_RESERVAS);
  revalidatePath("/", "layout");
  return { ok: true, message: `Reserva de ${d.guestName} cargada (${nights} noches)` };
}

export async function deleteBookingAction(form: FormData) {
  await assertOwner();
  await db.delete(schema.bookings).where(eq(schema.bookings.id, String(form.get("id"))));
  revalidateTag(TAG_RESERVAS);
  revalidatePath("/", "layout");
}

/* ==================== TARIFAS POR DIA ==================== */

/** Fija un precio para cada dia del rango indicado. */
export async function setRateRangeAction(_prev: State, form: FormData): Promise<State> {
  await assertOwner();
  const propertyId = String(form.get("propertyId"));
  const from = String(form.get("fromDate") ?? "");
  const to = String(form.get("toDate") ?? "");
  const price = Number(form.get("price"));

  if (!from || !to) return { error: "Elegí las dos fechas" };
  if (to < from) return { error: "La fecha final tiene que ser posterior" };
  if (!Number.isFinite(price) || price <= 0) return { error: "Ingresá un precio válido" };

  // el rango incluye el ultimo dia
  const fin = new Date(to + "T00:00:00");
  fin.setDate(fin.getDate() + 1);
  const dias = daysBetween(from, fin.toISOString().slice(0, 10));
  if (dias.length > 400) return { error: "El rango no puede superar los 400 días" };

  for (const day of dias) {
    await db.insert(schema.rates)
      .values({ id: uid(), propertyId, day, price })
      .onConflictDoUpdate({ target: [schema.rates.propertyId, schema.rates.day], set: { price } });
  }

  revalidateTag(TAG_CONTENIDO);
  revalidatePath("/", "layout");
  return { ok: true, message: `${dias.length} día(s) a ${money(price)}` };
}

export async function deleteRateAction(form: FormData) {
  await assertOwner();
  await db.delete(schema.rates).where(eq(schema.rates.id, String(form.get("id"))));
  revalidateTag(TAG_CONTENIDO);
  revalidatePath("/", "layout");
}

/** Borra todas las tarifas especiales de un alojamiento: vuelve al precio base. */
export async function clearRatesAction(form: FormData) {
  await assertOwner();
  await db.delete(schema.rates).where(eq(schema.rates.propertyId, String(form.get("propertyId"))));
  revalidateTag(TAG_CONTENIDO);
  revalidatePath("/", "layout");
}

/* ==================== CUENTA DEL PROPIETARIO ==================== */

const cuentaSchema = z.object({
  name: z.string().trim().min(2, "Ingresá tu nombre"),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  actual: z.string().min(1, "Ingresá tu contraseña actual"),
  nueva: z.string().optional().default(""),
  repetir: z.string().optional().default(""),
});

/**
 * Cambia nombre, email y/o contraseña del propietario.
 * Siempre pide la contraseña actual antes de tocar nada.
 */
export async function updateOwnerAccountAction(_prev: State, form: FormData): Promise<State> {
  const session = await assertOwner();

  const parsed = cuentaSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, actual, nueva, repetir } = parsed.data;

  const user = await one(db.select().from(schema.users).where(eq(schema.users.id, session.id)).limit(1));
  if (!user) return { error: "No encontramos tu cuenta" };

  if (!bcrypt.compareSync(actual, user.passwordHash)) {
    return { error: "La contraseña actual no es correcta" };
  }

  if (email !== user.email) {
    const ocupado = await one(db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1));
    if (ocupado && ocupado.id !== user.id) return { error: "Ya existe otra cuenta con ese email" };
  }

  const cambios: { name: string; email: string; passwordHash?: string } = { name, email };

  if (nueva || repetir) {
    if (nueva.length < 8) return { error: "La contraseña nueva necesita al menos 8 caracteres" };
    if (nueva !== repetir) return { error: "Las contraseñas nuevas no coinciden" };
    if (bcrypt.compareSync(nueva, user.passwordHash)) {
      return { error: "La contraseña nueva tiene que ser distinta de la actual" };
    }
    cambios.passwordHash = bcrypt.hashSync(nueva, 10);
  }

  await db.update(schema.users).set(cambios).where(eq(schema.users.id, user.id));

  // el nombre y el email viajan en la cookie: hay que reemitirla
  await createSession({ id: user.id, name, email, role: "owner" }, true);

  revalidatePath("/panel", "layout");
  return {
    ok: true,
    message: cambios.passwordHash ? "Datos y contraseña actualizados" : "Datos actualizados",
  };
}
