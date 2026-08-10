export const OWNER_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? "5491100000000";

export function waLink(phone: string, text: string) {
  const clean = phone.replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

export function requestMessage(o: {
  code: string; property: string; name: string; phone: string;
  checkIn: string; checkOut: string; nights: number; adults: number; children: number;
  estimate: string; message: string;
}) {
  return [
    `*Nueva solicitud de reserva — Delta Tigre*`,
    ``,
    `Codigo: ${o.code}`,
    `Alojamiento: ${o.property}`,
    `Huesped: ${o.name}`,
    o.phone ? `Telefono: ${o.phone}` : "",
    `Check-in: ${o.checkIn}`,
    `Check-out: ${o.checkOut}`,
    `Noches: ${o.nights}`,
    `Huespedes: ${o.adults} adulto(s)${o.children ? ` + ${o.children} menor(es)` : ""}`,
    `Estimado: ${o.estimate}`,
    o.message ? `` : "",
    o.message ? `Mensaje: ${o.message}` : "",
  ].filter(Boolean).join("\n");
}

export function replyMessage(o: {
  code: string; property: string; name: string; status: string;
  checkIn: string; checkOut: string; reply: string;
}) {
  const head = o.status === "confirmada"
    ? `*Tu reserva fue confirmada* — Delta Tigre`
    : o.status === "rechazada"
    ? `*Novedades sobre tu solicitud* — Delta Tigre`
    : `*Actualizacion de tu reserva* — Delta Tigre`;
  return [
    head, ``,
    `Hola ${o.name}!`,
    `Codigo: ${o.code}`,
    `Alojamiento: ${o.property}`,
    `Fechas: ${o.checkIn} al ${o.checkOut}`,
    `Estado: ${o.status.toUpperCase()}`,
    o.reply ? `` : "",
    o.reply ? o.reply : "",
  ].filter(Boolean).join("\n");
}
