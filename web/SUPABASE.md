# Migrar de SQLite a Supabase (Postgres)

En desarrollo la app usa SQLite a través de `@libsql/client` (`data/delta.db`), que no necesita configuración.
Para producción se pasa a Supabase. El esquema es idéntico: mismos nombres de tablas y columnas.

---

## 1. Crear el proyecto y las tablas

1. Entrá a [supabase.com](https://supabase.com) → **New project**. Guardá la contraseña de la base.
2. En el panel de Supabase: **SQL Editor → New query**.
3. Pegá el contenido de `drizzle/supabase.sql` y ejecutá.

## 2. Instalar el driver

```bash
npm install postgres
```

(Ya está en `package.json`.)

## 3. Cambiar la conexión

Editá `src/lib/db.ts` y reemplazá el bloque de libsql por:

```ts
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../../drizzle/schema.pg";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
export const db = drizzle(client, { schema });
export { schema };
export function ensureSchema() {} // el esquema ya se creó desde el SQL Editor
```

Y en cada archivo que importe el esquema, cambiá
`from "../../drizzle/schema"` por `from "../../drizzle/schema.pg"`.

> **No hay que tocar ninguna consulta.** Todas las de `src/lib/data.ts` y `src/app/actions.ts`
> ya están escritas en Drizzle estándar y en forma asíncrona (`await db.select()...`),
> que es exactamente como funciona el driver de Postgres. El cambio se limita a `db.ts`
> y a los imports del esquema.

## 4. Variables de entorno

En Supabase: **Project Settings → Database → Connection string → URI**.
Usá el pooler (puerto `6543`) si desplegás en Vercel:

```
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
AUTH_SECRET="cadena-larga-y-aleatoria"
NEXT_PUBLIC_WHATSAPP="5491133334444"
NEXT_PUBLIC_SITE_URL="https://deltatigre.com.ar"
```

## 5. Cargar los datos iniciales

```bash
npm run seed
```

## 6. Fotos subidas desde el panel

En desarrollo las fotos van a `public/uploads/`. En Vercel el disco es de solo lectura,
así que conviene usar **Supabase Storage**:

1. Supabase → **Storage → New bucket** llamado `fotos`, marcado como público.
2. En `uploadImagesAction` (`src/app/actions.ts`), reemplazá el `fs.writeFile` por
   `supabase.storage.from("fotos").upload(...)` y guardá en la base la URL pública que devuelve.
3. Agregá el dominio de Supabase a `next.config.ts`:

```ts
images: {
  formats: ["image/avif", "image/webp"],
  remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
}
```

Las fotos que ya vienen en `public/img/` no necesitan ningún cambio.

## 7. Seguridad

- La app se conecta a Postgres **desde el servidor**, nunca desde el navegador.
  No se expone ninguna key de Supabase al cliente.
- La sesión es un JWT firmado (HS256) en una cookie `httpOnly`, `sameSite=lax`
  y `secure` en producción.
- Las contraseñas se guardan con bcrypt (10 rondas).
- Todas las acciones del panel revalidan el rol `owner` en el servidor.
- Si alguna vez exponés la `anon key` al navegador, activá RLS en todas las tablas antes.
