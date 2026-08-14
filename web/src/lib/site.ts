/**
 * URL publica del sitio, normalizada.
 * Tolera que la variable venga con barra final, sin protocolo o vacia,
 * para que nunca se generen enlaces con doble barra.
 */
export function siteUrl(): string {
  const crudo = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  if (!crudo) {
    const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
    return vercel ? `https://${vercel}` : "http://localhost:3000";
  }
  const conProtocolo = /^https?:\/\//i.test(crudo) ? crudo : `https://${crudo}`;
  return conProtocolo.replace(/\/+$/, "");
}

/** Une la base con una ruta, sin duplicar barras. */
export const absUrl = (ruta = "/") => `${siteUrl()}/${ruta.replace(/^\/+/, "")}`.replace(/\/$/, "") || siteUrl();
