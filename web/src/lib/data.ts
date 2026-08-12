import { unstable_cache } from "next/cache";
import { db, schema, run } from "./db";
import { eq, asc, desc, and, inArray } from "drizzle-orm";

/**
 * La base esta en otra region, asi que cada consulta cuesta latencia.
 * El contenido publico cambia solo desde el panel: se cachea y se invalida
 * por etiqueta cuando el propietario edita algo.
 */
export const TAG_CONTENIDO = "contenido";
export const TAG_RESERVAS = "reservas";

function cache<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>, clave: string, tags: string[], revalidate = 3600
) {
  return unstable_cache(fn, [clave], { tags, revalidate });
}

export type Property = typeof schema.properties.$inferSelect;
export type Amenity = typeof schema.amenities.$inferSelect;
export type Img = typeof schema.images.$inferSelect;
export type Rule = typeof schema.rules.$inferSelect;
export type Booking = typeof schema.bookings.$inferSelect;
export type Activity = typeof schema.activities.$inferSelect;

async function _getSettings() {
  const rows = await run(() => db.select().from(schema.settings), "settings");
  return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, string>;
}

async function _getProperties() {
  return run(() => db.select().from(schema.properties).orderBy(asc(schema.properties.sortOrder)), "properties");
}

async function _getActiveProperties() {
  return run(
    () => db.select().from(schema.properties)
      .where(eq(schema.properties.active, 1))
      .orderBy(asc(schema.properties.sortOrder)),
    "properties activas"
  );
}

async function _getPropertyBySlug(slug: string) {
  const r = await run(
    () => db.select().from(schema.properties).where(eq(schema.properties.slug, slug)).limit(1),
    "property por slug"
  );
  return r[0] ?? null;
}

async function _getPropertyById(id: string) {
  const r = await run(
    () => db.select().from(schema.properties).where(eq(schema.properties.id, id)).limit(1),
    "property por id"
  );
  return r[0] ?? null;
}

async function _getImages(propertyId: string) {
  return run(
    () => db.select().from(schema.images)
      .where(eq(schema.images.propertyId, propertyId))
      .orderBy(asc(schema.images.sortOrder)),
    "images"
  );
}

async function _getCovers(ids: string[]) {
  if (!ids.length) return {} as Record<string, Img[]>;
  const all = await run(
    () => db.select().from(schema.images)
      .where(inArray(schema.images.propertyId, ids))
      .orderBy(asc(schema.images.sortOrder)),
    "covers"
  );
  const map: Record<string, Img[]> = {};
  for (const i of all) (map[i.propertyId] ??= []).push(i);
  return map;
}

async function _getAmenities(propertyId: string) {
  return run(
    () => db.select().from(schema.amenities)
      .where(eq(schema.amenities.propertyId, propertyId))
      .orderBy(asc(schema.amenities.sortOrder)),
    "amenities"
  );
}

async function _getRules(propertyId: string) {
  return run(
    () => db.select().from(schema.rules)
      .where(eq(schema.rules.propertyId, propertyId))
      .orderBy(asc(schema.rules.sortOrder)),
    "rules"
  );
}

async function _getNearby() {
  return run(() => db.select().from(schema.nearby).orderBy(asc(schema.nearby.sortOrder)), "nearby");
}

async function _getActivities() {
  return run(() => db.select().from(schema.activities).orderBy(asc(schema.activities.sortOrder)), "activities");
}

async function _getBlocks(propertyId: string) {
  return run(() => db.select().from(schema.blocks).where(eq(schema.blocks.propertyId, propertyId)), "blocks");
}

export async function getBookingsForUser(userId: string) {
  return run(
    () => db.select().from(schema.bookings)
      .where(eq(schema.bookings.userId, userId))
      .orderBy(desc(schema.bookings.createdAt)),
    "bookings del usuario"
  );
}

export async function getAllBookings() {
  return run(() => db.select().from(schema.bookings).orderBy(desc(schema.bookings.createdAt)), "bookings");
}

export async function getBooking(id: string) {
  const r = await run(
    () => db.select().from(schema.bookings).where(eq(schema.bookings.id, id)).limit(1),
    "booking"
  );
  return r[0] ?? null;
}

/** Fechas ocupadas (reservas confirmadas + bloqueos manuales) */
async function _getBusyRanges(propertyId: string) {
  const [confirmed, manual] = await Promise.all([
    run(
      () => db.select().from(schema.bookings)
        .where(and(eq(schema.bookings.propertyId, propertyId), eq(schema.bookings.status, "confirmada"))),
      "reservas confirmadas"
    ),
    _getBlocks(propertyId),
  ]);
  return [
    ...confirmed.map((b) => ({ from: b.checkIn, to: b.checkOut, reason: "Reservada" })),
    ...manual.map((b) => ({ from: b.fromDate, to: b.toDate, reason: b.reason })),
  ];
}

/**
 * Tarifas por dia, como mapa fecha -> precio.
 * Si la tabla `rates` todavia no existe (falta correr migracion-tarifas.sql),
 * se devuelve vacio y todo se cotiza al precio base en lugar de romper el sitio.
 */
async function _getRates(propertyId: string) {
  try {
    const filas = await run(
      () => db.select().from(schema.rates).where(eq(schema.rates.propertyId, propertyId)),
      "tarifas"
    );
    return Object.fromEntries(filas.map((r) => [r.day, r.price])) as Record<string, number>;
  } catch (e) {
    console.error("[tarifas] no disponibles, se usa el precio base:", e instanceof Error ? e.message : e);
    return {} as Record<string, number>;
  }
}

/** Tarifas con su id, para editarlas en el panel. Sin cache. */
export async function getRateRows(propertyId: string) {
  try {
    return await run(
      () => db.select().from(schema.rates)
        .where(eq(schema.rates.propertyId, propertyId))
        .orderBy(asc(schema.rates.day)),
      "tarifas panel"
    );
  } catch {
    return [] as (typeof schema.rates.$inferSelect)[];
  }
}

/** Ocupacion detallada para el panel: quien, cuando y por que. Sin cache. */
export async function getOccupancy(propertyId: string) {
  const [reservas, bloqueos] = await Promise.all([
    run(
      () => db.select().from(schema.bookings)
        .where(eq(schema.bookings.propertyId, propertyId))
        .orderBy(asc(schema.bookings.checkIn)),
      "ocupacion reservas"
    ),
    run(() => db.select().from(schema.blocks).where(eq(schema.blocks.propertyId, propertyId)), "ocupacion bloqueos"),
  ]);
  return {
    reservas,
    bloqueos,
    ocupados: [
      ...reservas
        .filter((b) => b.status === "confirmada")
        .map((b) => ({ from: b.checkIn, to: b.checkOut, reason: "Reservada", guest: b.guestName, code: b.code })),
      ...bloqueos.map((b) => ({ from: b.fromDate, to: b.toDate, reason: b.reason })),
    ],
  };
}

export function groupAmenities(list: Amenity[]) {
  const featured = list.filter((a) => a.featured === 1);
  const rest = list.filter((a) => a.featured !== 1);
  const groups: { category: string; items: Amenity[] }[] = [];
  for (const a of rest) {
    let g = groups.find((x) => x.category === a.category);
    if (!g) groups.push((g = { category: a.category, items: [] }));
    g.items.push(a);
  }
  return { featured, groups };
}


/* ---- Lecturas publicas, cacheadas por etiqueta ---- */
export const getSettings = cache(_getSettings, "getSettings", [TAG_CONTENIDO]);
export const getProperties = cache(_getProperties, "getProperties", [TAG_CONTENIDO]);
export const getActiveProperties = cache(_getActiveProperties, "getActiveProperties", [TAG_CONTENIDO]);
export const getPropertyBySlug = cache(_getPropertyBySlug, "getPropertyBySlug", [TAG_CONTENIDO]);
export const getPropertyById = cache(_getPropertyById, "getPropertyById", [TAG_CONTENIDO]);
export const getImages = cache(_getImages, "getImages", [TAG_CONTENIDO]);
export const getCovers = cache(_getCovers, "getCovers", [TAG_CONTENIDO]);
export const getAmenities = cache(_getAmenities, "getAmenities", [TAG_CONTENIDO]);
export const getRules = cache(_getRules, "getRules", [TAG_CONTENIDO]);
export const getNearby = cache(_getNearby, "getNearby", [TAG_CONTENIDO]);
export const getActivities = cache(_getActivities, "getActivities", [TAG_CONTENIDO]);
export const getBlocks = cache(_getBlocks, "getBlocks", [TAG_RESERVAS]);
export const getBusyRanges = cache(_getBusyRanges, "getBusyRanges", [TAG_RESERVAS]);
export const getRates = cache(_getRates, "getRates", [TAG_CONTENIDO]);
