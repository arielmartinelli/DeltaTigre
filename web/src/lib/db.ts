import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../../drizzle/schema.pg";
import { loadEnv } from "./env";

// Next carga .env solo; esto cubre los scripts que corren con tsx (seed, owner, tests).
if (!process.env.DATABASE_URL) loadEnv();

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "Falta DATABASE_URL.\n" +
    "Copiá .env.example a .env y pegá la connection string de Supabase (Transaction pooler, puerto 6543).\n" +
    "Ver web/SUPABASE.md"
  );
}

/**
 * Postgres (Supabase) sobre el *Transaction pooler*, puerto 6543.
 *
 * En serverless la lambda se congela entre invocaciones. Si eso pasa con un socket
 * abierto, al despertar el socket esta muerto pero el driver no lo sabe y la consulta
 * espera para siempre (504 a los 300 s). Por eso: sockets de vida corta, timeout en
 * cada consulta y reconexion automatica.
 */
function makeSql() {
  return postgres(url!, {
    prepare: false,                       // obligatorio con el pooler en modo transaction
    ssl: { rejectUnauthorized: false },   // el pooler presenta su propio certificado
    max: 2,
    idle_timeout: 5,                      // cerrar antes de que la lambda se congele
    max_lifetime: 60,
    connect_timeout: 8,
    onnotice: () => {},
  });
}

type Sql = ReturnType<typeof makeSql>;
type Db = ReturnType<typeof drizzle<typeof schema>>;

const g = globalThis as unknown as { __deltaSql?: Sql; __deltaDb?: Db };

let sqlRef: Sql = g.__deltaSql ?? makeSql();
let dbRef: Db = g.__deltaDb ?? drizzle(sqlRef, { schema });

if (process.env.NODE_ENV !== "production") {
  g.__deltaSql = sqlRef;
  g.__deltaDb = dbRef;
}

/** Descarta la conexion actual y abre una nueva. */
export async function resetConnection() {
  const viejo = sqlRef;
  sqlRef = makeSql();
  dbRef = drizzle(sqlRef, { schema });
  if (process.env.NODE_ENV !== "production") {
    g.__deltaSql = sqlRef;
    g.__deltaDb = dbRef;
  }
  viejo.end({ timeout: 0 }).catch(() => {});
}

/**
 * Proxy hacia la instancia vigente: si `resetConnection` cambia el cliente,
 * todo el codigo que importa `db` sigue funcionando sin cambios.
 */
export const db = new Proxy({} as Db, {
  get: (_t, prop) => Reflect.get(dbRef as object, prop),
}) as Db;

export const raw = new Proxy(function () {} as unknown as Sql, {
  get: (_t, prop) => Reflect.get(sqlRef as object, prop),
  apply: (_t, _this, args) => (sqlRef as unknown as (...a: unknown[]) => unknown)(...args),
}) as Sql;

export { schema };

/** El esquema se crea con drizzle/supabase.sql. Se mantiene por compatibilidad. */
export async function ensureSchema(): Promise<void> {}

/** Corta una promesa colgada para que el error sea visible y no un 504. */
export async function withTimeout<T>(p: Promise<T>, ms = 8000, label = "consulta"): Promise<T> {
  let t: NodeJS.Timeout;
  const guard = new Promise<never>((_, rej) => {
    t = setTimeout(() => rej(new Error(`Timeout de ${ms} ms en ${label}`)), ms);
  });
  try {
    return await Promise.race([p, guard]);
  } finally {
    clearTimeout(t!);
  }
}

/**
 * Ejecuta una consulta con timeout. Si se cuelga o falla la conexion,
 * reconecta y reintenta una vez.
 */
export async function run<T>(cb: () => Promise<T>, label = "consulta"): Promise<T> {
  try {
    return await withTimeout(cb(), 8000, label);
  } catch (e) {
    console.error(`[db] fallo en ${label}, reconectando:`, e instanceof Error ? e.message : e);
    await resetConnection();
    return await withTimeout(cb(), 8000, `${label} (reintento)`);
  }
}
