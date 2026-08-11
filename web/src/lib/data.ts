import { db, schema } from "./db";
import { eq, asc, desc, and, inArray } from "drizzle-orm";

export type Property = typeof schema.properties.$inferSelect;
export type Amenity = typeof schema.amenities.$inferSelect;
export type Img = typeof schema.images.$inferSelect;
export type Rule = typeof schema.rules.$inferSelect;
export type Booking = typeof schema.bookings.$inferSelect;
export type Activity = typeof schema.activities.$inferSelect;

export async function getSettings() {
  const rows = await db.select().from(schema.settings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, string>;
}

export async function getProperties() {
  return db.select().from(schema.properties).orderBy(asc(schema.properties.sortOrder));
}

export async function getActiveProperties() {
  return db.select().from(schema.properties)
    .where(eq(schema.properties.active, 1))
    .orderBy(asc(schema.properties.sortOrder));
}

export async function getPropertyBySlug(slug: string) {
  const r = await db.select().from(schema.properties).where(eq(schema.properties.slug, slug)).limit(1);
  return r[0] ?? null;
}

export async function getPropertyById(id: string) {
  const r = await db.select().from(schema.properties).where(eq(schema.properties.id, id)).limit(1);
  return r[0] ?? null;
}

export async function getImages(propertyId: string) {
  return db.select().from(schema.images)
    .where(eq(schema.images.propertyId, propertyId))
    .orderBy(asc(schema.images.sortOrder));
}

export async function getCovers(ids: string[]) {
  if (!ids.length) return {} as Record<string, Img[]>;
  const all = await db.select().from(schema.images)
    .where(inArray(schema.images.propertyId, ids))
    .orderBy(asc(schema.images.sortOrder));
  const map: Record<string, Img[]> = {};
  for (const i of all) (map[i.propertyId] ??= []).push(i);
  return map;
}

export async function getAmenities(propertyId: string) {
  return db.select().from(schema.amenities)
    .where(eq(schema.amenities.propertyId, propertyId))
    .orderBy(asc(schema.amenities.sortOrder));
}

export async function getRules(propertyId: string) {
  return db.select().from(schema.rules)
    .where(eq(schema.rules.propertyId, propertyId))
    .orderBy(asc(schema.rules.sortOrder));
}

export async function getNearby() {
  return db.select().from(schema.nearby).orderBy(asc(schema.nearby.sortOrder));
}

export async function getActivities() {
  return db.select().from(schema.activities).orderBy(asc(schema.activities.sortOrder));
}

export async function getBlocks(propertyId: string) {
  return db.select().from(schema.blocks).where(eq(schema.blocks.propertyId, propertyId));
}

export async function getBookingsForUser(userId: string) {
  return db.select().from(schema.bookings)
    .where(eq(schema.bookings.userId, userId))
    .orderBy(desc(schema.bookings.createdAt));
}

export async function getAllBookings() {
  return db.select().from(schema.bookings).orderBy(desc(schema.bookings.createdAt));
}

export async function getBooking(id: string) {
  const r = await db.select().from(schema.bookings).where(eq(schema.bookings.id, id)).limit(1);
  return r[0] ?? null;
}

/** Fechas ocupadas (reservas confirmadas + bloqueos manuales) */
export async function getBusyRanges(propertyId: string) {
  const [confirmed, manual] = await Promise.all([
    db.select().from(schema.bookings)
      .where(and(eq(schema.bookings.propertyId, propertyId), eq(schema.bookings.status, "confirmada"))),
    db.select().from(schema.blocks).where(eq(schema.blocks.propertyId, propertyId)),
  ]);
  return [
    ...confirmed.map((b) => ({ from: b.checkIn, to: b.checkOut, reason: "Reservada" })),
    ...manual.map((b) => ({ from: b.fromDate, to: b.toDate, reason: b.reason })),
  ];
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
