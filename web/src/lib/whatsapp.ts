export const OWNER_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? "5491100000000";

export function waLink(phone: string, text: string) {
  const clean = phone.replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

export function consultaMessage(o: {
  nombre: string; alojamiento: string; checkIn: string; checkOut: string;
  nights: number; adults: number; children: number; estimado: string;
}) {
  const huespedes = `${o.adults} adulto${o.adults > 1 ? "s" : ""}${o.children ? ` y ${o.children} menor${o.children > 1 ? "es" : ""}` : ""}`;
  return [
    `Hola! Soy ${o.nombre}.`,
    ``,
    `Quiero consultar por *${o.alojamiento}*:`,
    `Del ${o.checkIn} al ${o.checkOut} (${o.nights} noche${o.nights > 1 ? "s" : ""})`,
    `Somos ${huespedes}`,
    `Estimado en la web: ${o.estimado}`,
    ``,
    `Me confirmas si estan disponibles esas fechas?`,
  ].join("\n");
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
