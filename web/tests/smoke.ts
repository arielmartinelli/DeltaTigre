import { db, schema, raw, ensureSchema } from "../src/lib/db";
import { getBusyRanges, getPropertyBySlug, getImages, getAmenities, groupAmenities } from "../src/lib/data";
import { uid, bookingCode, rangesOverlap, nightsBetween, money } from "../src/lib/utils";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

let fails = 0;
const ok = (n: string, c: boolean) => { if (!c) fails++; console.log((c ? "PASS" : "FAIL") + "  " + n); };

(async () => {
  await ensureSchema();

  // --- logica pura ---
  ok("solapa parcial", rangesOverlap("2026-09-01", "2026-09-05", "2026-09-03", "2026-09-08"));
  ok("contiguo no solapa", !rangesOverlap("2026-09-01", "2026-09-05", "2026-09-05", "2026-09-08"));
  ok("contenido solapa", rangesOverlap("2026-09-01", "2026-09-10", "2026-09-03", "2026-09-04"));
  ok("noches", nightsBetween("2026-09-01", "2026-09-04") === 3);
  ok("codigo de reserva", /^DT-[A-Z0-9]{7}$/.test(bookingCode()));
  ok("moneda ARS", money(85000).includes("85.000"));

  // --- datos ---
  const p = await getPropertyBySlug("delta-dos");
  ok("propiedad existe", !!p);
  ok("15 fotos delta-dos", (await getImages(p!.id)).length === 15);
  const { featured, groups } = groupAmenities(await getAmenities(p!.id));
  ok("6 servicios destacados", featured.length === 6);
  ok("servicios agrupados", groups.length >= 8);

  // --- usuario ---
  const email = "test_" + Date.now() + "@x.com";
  const userId = uid();
  await db.insert(schema.users).values({
    id: userId, name: "Test", email, phone: "5491100000000",
    passwordHash: bcrypt.hashSync("clave12345", 10), role: "guest", createdAt: Date.now(),
  });
  const u = (await db.select().from(schema.users).where(eq(schema.users.email, email)))[0];
  ok("usuario creado", !!u);
  ok("password correcta verifica", bcrypt.compareSync("clave12345", u.passwordHash));
  ok("password incorrecta falla", !bcrypt.compareSync("otra", u.passwordHash));

  // --- reserva y calendario ---
  const now = Date.now();
  const bid = uid();
  await db.insert(schema.bookings).values({
    id: bid, code: bookingCode(), propertyId: p!.id, userId,
    guestName: "Test", guestEmail: email, guestPhone: "5491100000000",
    checkIn: "2026-12-10", checkOut: "2026-12-13", nights: 3, adults: 2, children: 0,
    message: "", estimate: 3 * p!.basePrice + p!.cleaningFee,
    status: "pendiente", ownerReply: "", createdAt: now, updatedAt: now,
  });
  let busy = await getBusyRanges(p!.id);
  ok("pendiente NO bloquea", !busy.some((b) => rangesOverlap("2026-12-10", "2026-12-13", b.from, b.to)));

  await db.update(schema.bookings).set({ status: "confirmada" }).where(eq(schema.bookings.id, bid));
  busy = await getBusyRanges(p!.id);
  ok("confirmada SI bloquea", busy.some((b) => rangesOverlap("2026-12-11", "2026-12-12", b.from, b.to)));
  ok("otras fechas libres", !busy.some((b) => rangesOverlap("2026-12-20", "2026-12-22", b.from, b.to)));

  const blockId = uid();
  await db.insert(schema.blocks).values({ id: blockId, propertyId: p!.id, fromDate: "2027-01-05", toDate: "2027-01-10", reason: "Mantenimiento" });
  busy = await getBusyRanges(p!.id);
  ok("bloqueo manual cuenta", busy.some((b) => b.reason === "Mantenimiento"));

  await db.delete(schema.bookings).where(eq(schema.bookings.id, bid));
  await db.delete(schema.users).where(eq(schema.users.id, userId));
  await db.delete(schema.blocks).where(eq(schema.blocks.id, blockId));
  ok("limpieza", true);

  console.log(fails ? `\n${fails} test(s) fallaron` : "\nTodos los tests pasaron");
  process.exit(fails ? 1 : 0);
})();
