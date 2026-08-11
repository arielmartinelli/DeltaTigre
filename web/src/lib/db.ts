import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../../drizzle/schema.pg";
import { loadEnv } from "./env";

// Next carga .env solo; esto cubre los scripts que corren con tsx (seed, tests).
if (!process.env.DATABASE_URL) loadEnv();

/**
 * Postgres (Supabase). En Vercel usar la connection string del *Transaction pooler* (puerto 6543).
 * El esquema se crea una sola vez ejecutando drizzle/supabase.sql en el SQL Editor de Supabase.
 */
const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "Falta DATABASE_URL.\n" +
    "Copiá .env.example a .env y pegá la connection string de Supabase (Transaction pooler, puerto 6543).\n" +
    "Ver web/SUPABASE.md"
  );
}

const g = globalThis as unknown as { __deltaSql?: ReturnType<typeof postgres> };

export const sql =
  g.__deltaSql ??
  postgres(url, {
    prepare: false,        // requerido por el pooler en modo transaction
    ssl: "require",
    max: 3,
    idle_timeout: 20,
    connect_timeout: 15,
  });

if (process.env.NODE_ENV !== "production") g.__deltaSql = sql;

export const db = drizzle(sql, { schema });
export const raw = sql;
export { schema };

/** El esquema ya existe en Supabase (drizzle/supabase.sql). Se mantiene por compatibilidad. */
export async function ensureSchema(): Promise<void> {}
