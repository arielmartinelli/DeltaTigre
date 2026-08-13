export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 9);

export const money = (n: number, currency = "ARS") =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

export function nightsBetween(a: string, b: string) {
  const d1 = new Date(a + "T00:00:00");
  const d2 = new Date(b + "T00:00:00");
  return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / 86400000));
}

export const isoToday = () => new Date().toISOString().slice(0, 10);

export function prettyDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

export function rangesOverlap(aIn: string, aOut: string, bIn: string, bOut: string) {
  return aIn < bOut && bIn < aOut;
}

export const bookingCode = () =>
  "DT-" + Math.random().toString(36).slice(2, 6).toUpperCase() + Date.now().toString(36).slice(-3).toUpperCase();

/** Lista de días de una estadía (la salida no se cobra). */
export function daysBetween(checkIn: string, checkOut: string): string[] {
  const out: string[] = [];
  const d = new Date(checkIn + "T00:00:00");
  const fin = new Date(checkOut + "T00:00:00");
  while (d < fin) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/** Precios generales por dia de la semana. 0 = usar el precio base. */
export type PreciosSemana = {
  basePrice: number;
  priceMonThu?: number;
  priceFri?: number;
  priceSatSun?: number;
};

/** Precio segun cantidad de huespedes: { 4: { monThu, fri, satSun }, ... } */
export type PreciosPorPersona = Record<number, { monThu: number; fri: number; satSun: number }>;

/** Cual de las tres franjas cae una fecha. */
export function franjaDe(day: string): "monThu" | "fri" | "satSun" {
  const dow = new Date(day + "T00:00:00").getDay(); // 0 domingo ... 6 sabado
  if (dow >= 1 && dow <= 4) return "monThu";
  if (dow === 5) return "fri";
  return "satSun";
}

/**
 * Precio de una noche. Prioridad:
 *   1. tarifa especial de esa fecha (feriados, temporada)
 *   2. precio de esa cantidad de huespedes para esa franja
 *   3. precio general de la franja
 *   4. precio base
 */
export function priceForDay(
  day: string, p: PreciosSemana,
  rates: Record<string, number> = {},
  guests = 0, porPersona: PreciosPorPersona = {}
) {
  const especial = rates[day];
  if (especial) return especial;

  const franja = franjaDe(day);
  const fila = porPersona[guests];
  if (fila && fila[franja] > 0) return fila[franja];

  const general =
    franja === "monThu" ? p.priceMonThu : franja === "fri" ? p.priceFri : p.priceSatSun;
  return general || p.basePrice;
}

/** Precio mas bajo posible, para el "desde $X". */
export function precioDesde(
  p: PreciosSemana, rates: Record<string, number> = {}, porPersona: PreciosPorPersona = {}
) {
  const valores = [
    p.priceMonThu, p.priceFri, p.priceSatSun, p.basePrice,
    ...Object.values(rates),
    ...Object.values(porPersona).flatMap((f) => [f.monThu, f.fri, f.satSun]),
  ].filter((v): v is number => typeof v === "number" && v > 0);
  return valores.length ? Math.min(...valores) : p.basePrice;
}

/** Suma el precio de cada noche de la estadia. */
export function quoteStay(
  checkIn: string, checkOut: string, precios: PreciosSemana,
  rates: Record<string, number> = {}, cleaningFee = 0,
  guests = 0, porPersona: PreciosPorPersona = {}
) {
  const dias = daysBetween(checkIn, checkOut);
  const noches = dias.map((d) => ({ day: d, price: priceForDay(d, precios, rates, guests, porPersona) }));
  const subtotal = noches.reduce((s, n) => s + n.price, 0);
  return { noches, nights: dias.length, subtotal, total: subtotal + cleaningFee };
}
