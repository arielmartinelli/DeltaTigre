import PageHead from "@/components/panel/PageHead";
import Calendar from "@/components/Calendar";
import Icon from "@/components/Icon";
import { StatusPill, inputCx } from "@/components/Bits";
import { addBlockAction, deleteBlockAction } from "@/app/actions";
import { getProperties, getOccupancy } from "@/lib/data";
import { prettyDate, isoToday, nightsBetween } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const maxDuration = 20;

export default async function FechasPage() {
  const props = await getProperties();
  const datos = await Promise.all(props.map(async (p) => ({ p, ...(await getOccupancy(p.id)) })));
  const hoy = isoToday();

  return (
    <>
      <PageHead
        eyebrow="Disponibilidad"
        title="Fechas disponibles"
        description="Mirá de un vistazo qué días están tomados y bloqueá los que no querés alquilar."
      />

      <div className="space-y-10">
        {datos.map(({ p, reservas, bloqueos, ocupados }) => {
          const proximas = reservas
            .filter((b) => b.checkOut >= hoy && b.status !== "cancelada" && b.status !== "rechazada")
            .slice(0, 8);
          const noches = reservas
            .filter((b) => b.status === "confirmada")
            .reduce((s, b) => s + nightsBetween(b.checkIn, b.checkOut), 0);

          return (
            <section key={p.id} className="shell">
              <div className="core overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/8 px-6 py-5">
                  <div>
                    <h2 className="font-display text-[22px] leading-none">{p.name}</h2>
                    <p className="mt-1.5 text-[12.5px] text-ink-45">
                      {reservas.filter((b) => b.status === "confirmada").length} confirmadas · {noches} noches vendidas · {bloqueos.length} bloqueos
                    </p>
                  </div>
                  <span className={`tag ${p.active ? "bg-palm-wash text-palm-deep" : "bg-ink/6 text-ink-45"}`}>
                    {p.active ? "Publicada" : "Oculta"}
                  </span>
                </div>

                <div className="grid gap-8 p-6 lg:grid-cols-2">
                  <div>
                    <Calendar ocupados={ocupados} meses={2} />
                  </div>

                  <div className="space-y-7">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-ink-45">Bloquear un período</p>
                      <form action={addBlockAction} className="mt-3 grid gap-2 sm:grid-cols-2">
                        <input type="hidden" name="propertyId" value={p.id} />
                        <input type="date" name="fromDate" required min={hoy} className={`${inputCx} !py-2.5 !text-[13.5px]`} />
                        <input type="date" name="toDate" required min={hoy} className={`${inputCx} !py-2.5 !text-[13.5px]`} />
                        <input name="reason" placeholder="Motivo" defaultValue="No disponible"
                          className={`${inputCx} !py-2.5 !text-[13.5px] sm:col-span-2`} />
                        <button className="rounded-full bg-ink px-4 py-2.5 text-[13px] text-cream transition-all duration-400 hover:bg-palm-deep active:scale-[0.97] sm:col-span-2">
                          Bloquear estas fechas
                        </button>
                      </form>

                      {bloqueos.length > 0 && (
                        <ul className="mt-4 space-y-1.5">
                          {bloqueos.map((b) => (
                            <li key={b.id} className="flex items-center justify-between gap-3 rounded-xl bg-shell/70 px-3.5 py-2 text-[13px]">
                              <span>{prettyDate(b.fromDate)} → {prettyDate(b.toDate)}</span>
                              <span className="truncate text-[11.5px] text-ink-45">{b.reason}</span>
                              <form action={deleteBlockAction}>
                                <input type="hidden" name="id" value={b.id} />
                                <button aria-label="Quitar bloqueo" className="transition-opacity hover:opacity-60">
                                  <Icon name="trash" className="h-3.5 w-3.5 text-[#8a3a24]" />
                                </button>
                              </form>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-ink-45">Próximas estadías</p>
                      {proximas.length === 0 ? (
                        <p className="mt-3 rounded-xl bg-shell/70 px-4 py-5 text-center text-[13px] text-ink-45">
                          No hay reservas próximas
                        </p>
                      ) : (
                        <ul className="mt-3 space-y-2">
                          {proximas.map((b) => (
                            <li key={b.id} className="rounded-xl bg-shell/60 px-3.5 py-2.5">
                              <div className="flex items-center justify-between gap-3">
                                <span className="truncate text-[14px] font-medium">{b.guestName}</span>
                                <StatusPill status={b.status} />
                              </div>
                              <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[12px] text-ink-45">
                                <span>{prettyDate(b.checkIn)} → {prettyDate(b.checkOut)}</span>
                                <span>· {b.nights} noches</span>
                                <span>· {b.adults + b.children} huéspedes</span>
                                <span className="tabular-nums">· {b.code}</span>
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
