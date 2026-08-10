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
