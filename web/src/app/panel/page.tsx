import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import BookingRow from "@/components/panel/BookingRow";
import { getAllBookings, getProperties } from "@/lib/data";
import { money } from "@/lib/utils";

export default async function PanelHome() {
  const [bookings, props] = await Promise.all([getAllBookings(), getProperties()]);
  const byId = Object.fromEntries(props.map((p) => [p.id, p]));

  const pend = bookings.filter((b) => b.status === "pendiente");
  const conf = bookings.filter((b) => b.status === "confirmada");
  const income = conf.reduce((s, b) => s + b.estimate, 0);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["cal", pend.length, "solicitudes nuevas"],
          ["check", conf.length, "reservas confirmadas"],
          ["users", bookings.length, "solicitudes totales"],
          ["cash", money(income), "confirmado (estimado)"],
        ].map(([ic, n, l], i) => (
          <Reveal key={l as string} delay={i * 70} className="shell">
            <div className="core px-5 py-6">
              <Icon name={ic as string} className="h-5 w-5 text-palm" />
              <p className="mt-4 display text-[clamp(1.7rem,3.4vw,2.2rem)] leading-none">{n}</p>
              <p className="mt-1.5 text-[12.5px] text-ink-45">{l as string}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {pend.length > 0 && (
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.16em] text-ink-45">Requieren respuesta</h2>
          <div className="mt-5 space-y-3">
            {pend.map((b, i) => (
              <Reveal key={b.id} delay={i * 60}>
                <BookingRow b={b} propertyName={byId[b.propertyId]?.name ?? "—"} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.16em] text-ink-45">Todas las solicitudes</h2>
        {bookings.length === 0 ? (
          <div className="mt-5 shell">
            <div className="core px-6 py-14 text-center">
              <p className="font-display text-xl">Todavía no hay solicitudes</p>
              <p className="mt-2 text-[14px] text-ink-45">Cuando alguien pida fechas desde el sitio, van a aparecer acá.</p>
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
  );
}

export const dynamic = "force-dynamic";
export const maxDuration = 20;
