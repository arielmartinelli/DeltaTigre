import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { Eyebrow, StatusPill } from "@/components/Bits";
import { CTA } from "@/components/Button";
import { getSession } from "@/lib/session";
import { getBookingsForUser, getProperties, getCovers } from "@/lib/data";
import { cancelBookingAction, logoutAction } from "@/app/actions";
import { money, prettyDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false } };

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/ingresar");
  if (session.role === "owner") redirect("/panel");

  const [bookings, props] = await Promise.all([getBookingsForUser(session.id), getProperties()]);
  const covers = await getCovers(props.map((p) => p.id));
  const byId = Object.fromEntries(props.map((p) => [p.id, p]));

  const active = bookings.filter((b) => b.status === "pendiente" || b.status === "confirmada");
  const past = bookings.filter((b) => !["pendiente", "confirmada"].includes(b.status));

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-32 md:px-8 md:pt-40">
      <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>Mi cuenta</Eyebrow>
          <h1 className="mt-5 font-display text-[clamp(2.2rem,5.5vw,3.6rem)] leading-[1]">
            Hola, {session.name.split(" ")[0]}
          </h1>
          <p className="mt-3 text-[14.5px] text-ink-45">{session.email}</p>
        </div>
        <form action={logoutAction}>
          <button className="ul-slide text-[13px] text-ink-45 transition-colors hover:text-ink">Cerrar sesión</button>
        </form>
      </Reveal>

      {bookings.length === 0 ? (
        <Reveal delay={100} className="mt-14 shell">
          <div className="core flex flex-col items-center gap-5 px-7 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-palm-wash text-palm-deep">
              <Icon name="cal" className="h-6 w-6" />
            </span>
            <h2 className="font-display text-2xl">Todavía no tenés solicitudes</h2>
            <p className="max-w-sm text-[14.5px] leading-relaxed text-ink-45">
              Elegí una de las dos casas, marcá tus fechas y enviamos la solicitud al propietario.
            </p>
            <CTA href="/cabanas" className="mt-2">Ver las cabañas</CTA>
          </div>
        </Reveal>
      ) : (
        <div className="mt-14 space-y-14">
          {[["Solicitudes activas", active], ["Historial", past]].map(([label, list]) => {
            const items = list as typeof bookings;
            if (!items.length) return null;
            return (
              <section key={label as string}>
                <h2 className="text-[11px] uppercase tracking-[0.16em] text-ink-45">{label as string}</h2>
                <div className="mt-5 space-y-4">
                  {items.map((b, i) => {
                    const p = byId[b.propertyId];
                    const cover = covers[b.propertyId]?.[0];
                    return (
                      <Reveal key={b.id} delay={i * 70} className="shell">
                        <div className="core flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
                          <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-[1.25rem] sm:h-28 sm:w-40">
                            {cover && <Image src={cover.url} alt="" fill sizes="160px" className="object-cover" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <StatusPill status={b.status} />
                              <span className="text-[11.5px] tabular-nums text-ink-45">{b.code}</span>
                            </div>
                            <h3 className="mt-2.5 font-display text-[23px]">{p?.name ?? "Alojamiento"}</h3>
                            <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px] text-ink-45">
                              <span className="inline-flex items-center gap-1.5"><Icon name="cal" className="h-3.5 w-3.5" />{prettyDate(b.checkIn)} → {prettyDate(b.checkOut)}</span>
                              <span className="inline-flex items-center gap-1.5"><Icon name="users" className="h-3.5 w-3.5" />{b.adults + b.children}</span>
                              <span className="inline-flex items-center gap-1.5"><Icon name="clock" className="h-3.5 w-3.5" />{b.nights} noches</span>
                            </p>
                            {b.ownerReply && (
                              <p className="mt-3 rounded-xl bg-shell/80 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-ink-70">
                                <span className="text-[11px] uppercase tracking-[0.14em] text-ink-45">Respuesta del propietario</span><br />
                                {b.ownerReply}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                            <p className="display text-[22px]">{money(b.estimate, p?.currency ?? "ARS")}</p>
                            {(b.status === "pendiente" || b.status === "confirmada") && (
                              <form action={cancelBookingAction}>
                                <input type="hidden" name="id" value={b.id} />
                                <button className="ul-slide text-[12.5px] text-ink-45 hover:text-ink">Cancelar</button>
                              </form>
                            )}
                          </div>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>
              </section>
            );
          })}

          <Reveal className="flex justify-center pt-4">
            <CTA href="/cabanas" variant="outline" icon="plus">Nueva solicitud</CTA>
          </Reveal>
        </div>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
export const maxDuration = 20;
