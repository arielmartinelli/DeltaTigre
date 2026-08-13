import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import PageHead from "@/components/panel/PageHead";
import BookingRow from "@/components/panel/BookingRow";
import NuevaReserva from "@/components/panel/NuevaReserva";
import { getAllBookings, getProperties, getRates } from "@/lib/data";
import { money, isoToday } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const maxDuration = 20;

export default async function PanelHome() {
  const [bookings, props] = await Promise.all([getAllBookings(), getProperties()]);
  const rates = Object.fromEntries(
    await Promise.all(props.map(async (p) => [p.id, await getRates(p.id)] as const))
  );
  const byId = Object.fromEntries(props.map((p) => [p.id, p]));
  const hoy = isoToday();

  const conf = bookings.filter((b) => b.status === "confirmada");
  const proximas = conf.filter((b) => b.checkOut >= hoy);
  const ingresos = conf.reduce((s, b) => s + b.estimate, 0);

  return (
    <>
      <PageHead
        eyebrow="Administración"
        title="Reservas"
        description="Todas las reservas se cargan desde acá. Las consultas de los huéspedes llegan por WhatsApp."
      />

      <div className="space-y-10">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["cal", proximas.length, "estadías próximas"],
            ["check", conf.length, "confirmadas en total"],
            ["users", bookings.length, "reservas cargadas"],
            ["cash", money(ingresos), "facturado (confirmado)"],
          ].map(([ic, n, l], i) => (
            <Reveal key={l as string} delay={i * 70} className="shell">
              <div className="core px-5 py-6">
                <Icon name={ic as string} className="h-5 w-5 text-palm" />
                <p className="mt-4 display text-[clamp(1.5rem,3vw,2rem)] leading-none">{n}</p>
                <p className="mt-1.5 text-[12.5px] text-ink-45">{l as string}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <NuevaReserva
          casas={props.map((p) => ({
            id: p.id, name: p.name, maxGuests: p.maxGuests,
            cleaningFee: p.cleaningFee, minNights: p.minNights,
            basePrice: p.basePrice, priceMonThu: p.priceMonThu,
            priceFri: p.priceFri, priceSatSun: p.priceSatSun,
          }))}
          rates={rates}
        />

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.16em] text-ink-45">
            {bookings.length ? "Todas las reservas" : "Sin reservas todavía"}
          </h2>
          {bookings.length === 0 ? (
            <div className="mt-5 shell">
              <div className="core px-6 py-14 text-center">
                <p className="font-display text-xl">Todavía no cargaste ninguna reserva</p>
                <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-ink-45">
                  Cuando alguien te escriba por WhatsApp y cierres el trato, cargala acá con el botón de arriba
                  para que esas fechas se bloqueen en el sitio.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {bookings.map((b, i) => (
                <Reveal key={b.id} delay={Math.min(i, 6) * 50}>
                  <BookingRow b={b} propertyName={byId[b.propertyId]?.name ?? "—"} />
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
