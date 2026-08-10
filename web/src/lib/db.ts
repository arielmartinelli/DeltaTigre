import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import fs from "node:fs";
import path from "node:path";
import * as schema from "../../drizzle/schema";

/**
 * libsql: SQLite embebido con binarios precompilados (no requiere compilador).
 * En produccion, apuntar DATABASE_URL a Supabase — ver SUPABASE.md
 */
const raw_url = process.env.DATABASE_URL ?? "file:./data/delta.db";
let url = raw_url;
if (url.startsWith("file:")) {
  const rel = url.replace(/^file:/, "");
  const abs = path.isAbsolute(rel) ? rel : path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  url = "file:" + abs;
}

const g = globalThis as unknown as { __deltaClient?: ReturnType<typeof createClient> };
export const client = g.__deltaClient ?? createClient({ url });
if (process.env.NODE_ENV !== "production") g.__deltaClient = client;

export const db = drizzle(client, { schema });
export const raw = client;
export { schema };

const DDL = `
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, phone TEXT NOT NULL DEFAULT '', password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'guest', created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS properties (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, kind TEXT NOT NULL DEFAULT 'Casa', tagline TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', address TEXT NOT NULL DEFAULT '', lat REAL NOT NULL DEFAULT -34.418, lng REAL NOT NULL DEFAULT -58.579, size_m2 INTEGER NOT NULL DEFAULT 0, bedrooms INTEGER NOT NULL DEFAULT 1, bathrooms INTEGER NOT NULL DEFAULT 1, beds INTEGER NOT NULL DEFAULT 1, max_guests INTEGER NOT NULL DEFAULT 2, base_price INTEGER NOT NULL DEFAULT 0, high_price INTEGER NOT NULL DEFAULT 0, cleaning_fee INTEGER NOT NULL DEFAULT 0, min_nights INTEGER NOT NULL DEFAULT 2, currency TEXT NOT NULL DEFAULT 'ARS', rating REAL NOT NULL DEFAULT 0, reviews INTEGER NOT NULL DEFAULT 0, check_in TEXT NOT NULL DEFAULT '10:00 - 18:00', check_out TEXT NOT NULL DEFAULT '08:00 - 18:00', active INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS images (id TEXT PRIMARY KEY, property_id TEXT NOT NULL, url TEXT NOT NULL, alt TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS amenities (id TEXT PRIMARY KEY, property_id TEXT NOT NULL, category TEXT NOT NULL, label TEXT NOT NULL, icon TEXT NOT NULL DEFAULT 'check', featured INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS rules (id TEXT PRIMARY KEY, property_id TEXT NOT NULL, label TEXT NOT NULL, value TEXT NOT NULL, icon TEXT NOT NULL DEFAULT 'info', sort_order INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS nearby (id TEXT PRIMARY KEY, category TEXT NOT NULL, name TEXT NOT NULL, distance TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS activities (id TEXT PRIMARY KEY, title TEXT NOT NULL, summary TEXT NOT NULL DEFAULT '', body TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT '', tag TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS bookings (id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, property_id TEXT NOT NULL, user_id TEXT NOT NULL, guest_name TEXT NOT NULL, guest_email TEXT NOT NULL, guest_phone TEXT NOT NULL DEFAULT '', check_in TEXT NOT NULL, check_out TEXT NOT NULL, nights INTEGER NOT NULL DEFAULT 1, adults INTEGER NOT NULL DEFAULT 1, children INTEGER NOT NULL DEFAULT 0, message TEXT NOT NULL DEFAULT '', estimate INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'pendiente', owner_reply TEXT NOT NULL DEFAULT '', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS blocks (id TEXT PRIMARY KEY, property_id TEXT NOT NULL, from_date TEXT NOT NULL, to_date TEXT NOT NULL, reason TEXT NOT NULL DEFAULT 'Bloqueo manual');
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '');
CREATE INDEX IF NOT EXISTS idx_img_prop ON images(property_id);
CREATE INDEX IF NOT EXISTS idx_am_prop ON amenities(property_id);
CREATE INDEX IF NOT EXISTS idx_bk_prop ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bk_user ON bookings(user_id);
`;

let ready: Promise<void> | null = null;
/** Crea el esquema si no existe. Idempotente y cacheado por proceso. */
export function ensureSchema(): Promise<void> {
  return (ready ??= client.executeMultiple(DDL));
}
