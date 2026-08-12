# Supabase + Vercel — puesta en producción

La app corre sobre **Postgres**. En desarrollo y en producción se conecta a la misma
base de Supabase; no hay dos drivers ni dos esquemas.

---

## 0. Si ya tenías el sitio funcionando

Ejecutá `drizzle/migracion-tarifas.sql` en el **SQL Editor**. Crea la tabla `rates`
(precio por día) y hace opcional el email del huésped, porque las reservas ahora las
carga el propietario.

## 1. Crear las tablas (una sola vez)

1. En Supabase → **SQL Editor → New query**.
2. Pegá el contenido de `drizzle/supabase.sql` y ejecutá.
3. Verificá en **Table Editor** que estén las 10 tablas.

## 2. Connection string

**Connect** (arriba a la derecha) → **Connection string** → **Transaction pooler** (puerto `6543`).
Reemplazá `[YOUR-PASSWORD]` por la contraseña de la base.

```
postgresql://postgres.XXXX:PASSWORD@aws-1-REGION.pooler.supabase.com:6543/postgres
```

> Tiene que ser el pooler en modo *transaction*. La conexión directa (puerto `5432`)
> no soporta la cantidad de conexiones que abre una función serverless.

## 3. Bucket para las fotos del panel

En Vercel el disco es de solo lectura, así que las fotos que se suben desde el panel
van a Supabase Storage.

1. Supabase → **Storage → New bucket**.
2. Nombre: `fotos`. Marcalo como **Public bucket**.
3. Copiá la **service_role key** desde **Settings → API Keys**.

> La `service_role` key es de servidor y nunca se expone al navegador. No la subas al repo.

Si `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` no están definidas, las fotos se guardan
en `public/uploads/` — sirve para desarrollo local, no para Vercel.

## 4. Cargar los datos iniciales

Desde tu máquina, con el `.env` completo:

```bash
npm run seed
```

Carga las dos casas, las 28 fotos, los servicios, las normas, los alrededores,
las experiencias y el usuario propietario.

## 5. Variables en Vercel

**Settings → Environment Variables** (marcá los tres entornos):

| Variable | Valor |
|---|---|
| `DATABASE_URL` | la connection string del paso 2 |
| `AUTH_SECRET` | `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `NEXT_PUBLIC_WHATSAPP` | número del propietario, solo dígitos |
| `NEXT_PUBLIC_SITE_URL` | la URL del deploy |
| `SUPABASE_URL` | `https://XXXX.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | la service_role key |
| `SUPABASE_BUCKET` | `fotos` |

## 6. Root Directory en Vercel

**Settings → Build and Deployment → Root Directory** → `web`.

Es el error más común: si queda en la raíz del repo, Vercel no encuentra el `package.json`,
no compila nada y el sitio responde **404 NOT_FOUND**.

---

## Seguridad

- La app se conecta a Postgres **sólo desde el servidor**. No se expone ninguna key al navegador.
- La sesión es un JWT firmado (HS256) en cookie `httpOnly`, `sameSite=lax` y `secure` en producción.
- Las contraseñas se guardan con bcrypt, 10 rondas.
- Todas las acciones del panel revalidan el rol `owner` en el servidor antes de tocar la base.
- Las tablas no tienen RLS porque el acceso es sólo por el servidor con credenciales privadas.
  Si alguna vez usás la `anon key` desde el navegador, activá RLS antes.

## Si algo falla

| Síntoma | Causa |
|---|---|
| `404 NOT_FOUND` | Root Directory no apunta a `web` |
| `Falta DATABASE_URL` | no cargaste la variable en Vercel |
| `password authentication failed` | la contraseña de la URL está mal o tiene caracteres sin escapar |
| `relation "properties" does not exist` | no ejecutaste `drizzle/supabase.sql` |
| El sitio carga vacío | falta correr `npm run seed` |
| `Storage 400` al subir fotos | el bucket `fotos` no existe o no es público |
