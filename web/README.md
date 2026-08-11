# Delta Tigre — sitio web y sistema de reservas

Sitio estilo Airbnb/Booking para las dos casas de Delta Tigre, con cuentas de huésped,
solicitudes de reserva que salen por WhatsApp y un panel del propietario para editar todo.

Stack: **Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Drizzle ORM**
Base de datos: **Postgres (Supabase)**, con el driver `postgres` en JS puro — no requiere
compilador ni Visual Studio para instalarse.

---

## Arrancar en 3 pasos

```bash
npm install
# copiá .env.example a .env y completá DATABASE_URL y AUTH_SECRET
npm run seed     # carga las 2 casas, fotos, servicios, normas y el usuario propietario
npm run dev      # http://localhost:3000
```

El esquema de la base se crea una sola vez ejecutando `drizzle/supabase.sql`
en el **SQL Editor** de Supabase. Ver [SUPABASE.md](./SUPABASE.md).

> **Si el proyecto está dentro de OneDrive**: pausá la sincronización antes de `npm install`.
> OneDrive intenta sincronizar los miles de archivos de `node_modules` y provoca errores
> `EPERM: operation not permitted`. Alternativa mejor: mover la carpeta `web` fuera de OneDrive.

**Usuario del propietario (creado por el seed):**

| Email | Contraseña |
|---|---|
| `propietario@deltatigre.com.ar` | `DeltaTigre2026!` |

> Cambiá esa contraseña antes de publicar el sitio.

### Variables de entorno (`.env`)

```
DATABASE_URL="postgresql://postgres.XXXX:PASSWORD@aws-1-REGION.pooler.supabase.com:6543/postgres"
AUTH_SECRET="cadena-larga-y-aleatoria-de-al-menos-32-caracteres"
NEXT_PUBLIC_WHATSAPP="5491133334444"   # número del propietario, solo dígitos con código de país
NEXT_PUBLIC_SITE_URL="https://deltatigre.com.ar"

# Necesarias para que el panel pueda subir fotos en Vercel (disco de solo lectura)
SUPABASE_URL="https://XXXX.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="..."
SUPABASE_BUCKET="fotos"
```

Generar el secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

El WhatsApp también se puede cambiar sin tocar el código, desde **Panel → Contenido**.

---

## Mapa del sitio

| Ruta | Qué es |
|---|---|
| `/` | Portada: hero con parallax, bento de fotos, las dos casas, experiencias, alrededores |
| `/cabanas` | Listado de las dos casas |
| `/cabanas/delta-uno` · `/cabanas/delta-dos` | Ficha completa: galería con lightbox, servicios agrupados, normas, mapa, formulario de reserva |
| `/ubicacion` | Cómo llegar paso a paso + mapa + qué hay cerca |
| `/experiencias` | Qué hacer en el Delta |
| `/ingresar` · `/crear-cuenta` | Cuentas de huésped |
| `/mi-cuenta` | Reservas del huésped y respuestas del propietario |
| `/panel` | **Panel del propietario** (solo rol `owner`) |

---

## Cómo funciona una reserva

1. El huésped se crea una cuenta y elige fechas en la ficha de la casa.
2. Al enviar, la solicitud queda guardada con estado **pendiente** y se abre WhatsApp
   con el mensaje ya escrito hacia el número del propietario (código, casa, fechas, huéspedes, estimado).
3. La solicitud aparece en **Panel → Reservas**.
4. El propietario la marca **confirmada / rechazada** y escribe un mensaje.
   Al guardar se abre WhatsApp hacia el huésped con la respuesta, y esa misma respuesta
   queda visible en `/mi-cuenta`.
5. Sólo las reservas **confirmadas** (y los bloqueos manuales) ocupan el calendario.

Validaciones: fechas pasadas, salida anterior a la entrada, estadía mínima, capacidad máxima
y solapamiento con fechas ya ocupadas — todo se chequea en el cliente y otra vez en el servidor.

---

## Panel del propietario

- **Reservas** — métricas, bandeja de solicitudes, cambio de estado y respuesta por WhatsApp.
- **Alojamientos** — por cada casa:
  - textos, dirección, coordenadas del mapa, metros, dormitorios, baños, capacidad
  - **precios**: por noche, temporada alta, limpieza final, noches mínimas
  - **fotos**: subir, reordenar, editar descripción, borrar (la primera es la portada)
  - **servicios**: agregar/quitar, elegir ícono, marcar como destacado
  - **bloquear fechas** manualmente
  - publicar u ocultar la casa
- **Contenido** — textos de la portada, WhatsApp, email, Instagram y las experiencias.

---

## Diseño

Paleta tomada del logo: crema `#F5F3E6`, tinta `#10120E` y el verde de la palmera `#5C8C3C`.
Tipografías Fraunces (títulos) y Plus Jakarta Sans (texto).

Detalles de interacción: navbar flotante de vidrio, hamburguesa que se transforma en X,
revelados por scroll con `IntersectionObserver`, hero con parallax en `transform`,
máscaras de línea en los títulos, hover magnético en botones, miniaturas que asoman en
las tarjetas, galería con lightbox y teclado, e íconos SVG dibujados a medida.

Todo respeta `prefers-reduced-motion`, y las animaciones usan sólo `transform` y `opacity`.

---

## Producción

```bash
npm run build && npm start
```

Para migrar la base a Supabase, ver **[SUPABASE.md](./SUPABASE.md)**.

### Antes de publicar

- [ ] Cambiar `AUTH_SECRET` por una cadena aleatoria larga
- [ ] Cambiar la contraseña del usuario propietario
- [ ] Poner el WhatsApp real en `.env` y en Panel → Contenido
- [ ] Poner `NEXT_PUBLIC_SITE_URL` con el dominio real
- [ ] Crear el bucket `fotos` en Supabase Storage y cargar `SUPABASE_SERVICE_ROLE_KEY`
- [ ] En Vercel, poner **Root Directory** en `web`

---

## Tests

```bash
npx tsx tests/smoke.ts
```

Verifica el seed, el hash de contraseñas, y que el calendario se bloquee sólo con
reservas confirmadas y bloqueos manuales.
