# Delta Tigre

Sitio web y sistema de reservas para las dos casas de Delta Tigre, sobre el Arroyo Gambado
en la primera sección del Delta de Tigre, Buenos Aires.

## Estructura del repositorio

```
web/          → la aplicación (Next.js 15 + TypeScript + Tailwind + Drizzle)
delta1/       → fotos originales y capturas de Booking de Delta Uno
delta2/       → fotos originales y capturas de Booking de Delta Dos
logo.jpg      → logo original
```

Las fotos ya optimizadas a WebP que usa el sitio están en `web/public/img/`.

## Arrancar

```bash
cd web
npm install
npm run seed
npm run dev
```

Documentación completa en **[web/README.md](./web/README.md)**.
Migración a Supabase en **[web/SUPABASE.md](./web/SUPABASE.md)**.

## Qué incluye

- Sitio público: portada, ficha de cada casa con galería, servicios, normas y mapa, ubicación y experiencias
- Cuentas de huésped y solicitudes de reserva que salen por WhatsApp
- Panel del propietario para gestionar reservas, precios, fotos, servicios y contenido
