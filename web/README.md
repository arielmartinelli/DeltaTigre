# Delta Tigre — sitio web y sistema de reservas

Sitio estilo Airbnb/Booking para las dos casas de Delta Tigre. El huésped consulta
disponibilidad por WhatsApp con un mensaje armado por el sitio; el propietario administra
reservas, fechas, precios por día y contenido desde su panel.

**No hay cuentas de usuario.** La única sesión del sistema es la del propietario.

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

Al ingresar, la casilla **«Mantener la sesión abierta»** deja la sesión viva 6 meses:
no vuelve a pedir la contraseña hasta que se cierre desde el panel.

> **Cambiá esa contraseña antes de publicar el sitio**, porque figura en este archivo:
>
> ```bash
> npm run owner -- propietario@deltatigre.com.ar "TuNuevaClave"
> ```
>
> El mismo comando sirve para crear otro usuario propietario o recuperar el acceso.

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
| `/propietario` | Acceso del propietario |
| `/panel` | **Panel administrativo** |

---

## Cómo funciona una consulta

1. El huésped entra a la ficha de una casa y ve el **calendario con los días ocupados**.
2. Escribe su nombre, elige fechas y cantidad de huéspedes. El sitio calcula el estimado
   sumando el precio de cada noche.
3. Toca **Consultar disponibilidad** y se abre WhatsApp con el mensaje ya escrito:

   > Hola! Soy Ariel.
   > Quiero consultar por **Delta Uno**:
   > Del 12 de sep al 15 de sep (3 noches)
   > Somos 2 adultos y 1 menor
   > Estimado en la web: $ 270.000
   > Me confirmás si están disponibles esas fechas?

4. El propietario responde por WhatsApp. Si cierran el trato, **carga la reserva en el panel**
   y esas fechas se bloquean solas en el calendario del sitio.

No se guarda nada en la base al consultar: el sitio público es solo lectura.

## Panel del propietario

- **Reservas** — métricas, carga manual de reservas y cambio de estado. Una reserva
  *confirmada* cierra sus fechas en el sitio; una *pendiente* no.
- **Fechas disponibles** — calendario por casa, bloqueo de períodos, **precio por día**
  (fines de semana, feriados, temporada) y listado de próximas estadías con nombre del huésped.
- **Alojamientos** — por cada casa:
  - textos, dirección, coordenadas del mapa, metros, dormitorios, baños, capacidad
  - **precios**: base por noche, limpieza final, noches mínimas
    (el precio de cada fecha se ajusta en *Fechas disponibles*)
  - **fotos**: subir, reordenar, editar descripción, borrar (la primera es la portada)
  - **servicios**: agregar/quitar, elegir ícono, marcar como destacado
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
- [ ] Cambiar la contraseña del propietario con `npm run owner`
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
