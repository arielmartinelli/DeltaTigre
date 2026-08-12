"use client";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { createBookingAction, type State } from "@/app/actions";
import { ActionButton } from "./Button";
import { inputCx } from "./Bits";
import Icon from "./Icon";
import Calendar, { type Ocupacion } from "./Calendar";
import { money, nightsBetween, isoToday, prettyDate, rangesOverlap } from "@/lib/utils";
import type { Property } from "@/lib/data";

export default function BookingForm({
  property, busy, isLogged,
}: { property: Property; busy: Ocupacion[]; isLogged: boolean }) {
  const [state, action, pending] = useActionState<State, FormData>(createBookingAction, {});
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(Math.min(2, property.maxGuests));
  const [children, setChildren] = useState(0);
  const [verCalendario, setVerCalendario] = useState(false);
  const [verDetalle, setVerDetalle] = useState(false);

  const guests = adults + children;
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const subtotal = nights * property.basePrice;
  const total = nights > 0 ? subtotal + property.cleaningFee : 0;

  const localError = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    if (nights < 1) return "La salida tiene que ser posterior a la entrada";
    if (nights < property.minNights) return `Estadía mínima: ${property.minNights} noches`;
    if (guests > property.maxGuests) return `Máximo ${property.maxGuests} huéspedes`;
    if (busy.some((b) => rangesOverlap(checkIn, checkOut, b.from, b.to))) return "Esas fechas ya están ocupadas";
    return null;
  }, [checkIn, checkOut, nights, guests, busy, property]);

  useEffect(() => {
    if (state.ok && state.waUrl) window.open(state.waUrl, "_blank", "noopener");
  }, [state.ok, state.waUrl]);

  /** Al tocar el calendario: primer click entrada, segundo salida. */
  const elegir = (fecha: string) => {
    if (!checkIn || (checkIn && checkOut) || fecha <= checkIn) {
      setCheckIn(fecha); setCheckOut("");
    } else {
      setCheckOut(fecha); setVerCalendario(false);
    }
  };

  if (state.ok) {
    return (
      <div className="shell">
        <div className="core px-6 py-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-palm-wash text-palm-deep">
            <Icon name="check" className="h-5 w-5" />
          </span>
          <h3 className="mt-4 font-display text-xl">Solicitud enviada</h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-70">
            Código <span className="font-medium text-ink">{state.code}</span>. Te respondemos por WhatsApp.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <a href={state.waUrl} target="_blank" rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-palm py-2.5 pl-5 pr-2 text-[13px] text-paper transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-palm-deep active:scale-[0.97]">
              Abrir WhatsApp
              <span className="grid h-7 w-7 place-items-center rounded-full bg-paper/18 transition-transform duration-500 group-hover:translate-x-1">
                <Icon name="wa" className="h-3.5 w-3.5" />
              </span>
            </a>
            <Link href="/mi-cuenta" className="ul-slide mx-auto text-[12.5px] text-ink-45 hover:text-ink">Ver mis reservas</Link>
          </div>
        </div>
      </div>
    );
  }

  const fechasListas = checkIn && checkOut;

  return (
    <div className="shell">
      <div className="core p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p>
            <span className="display text-[24px] leading-none">{money(property.basePrice, property.currency)}</span>
            <span className="ml-1.5 text-[12.5px] text-ink-45">/ noche</span>
          </p>
          <span className="tag bg-palm-wash text-palm-deep">mín. {property.minNights} noches</span>
        </div>

        <form action={action} className="mt-4 space-y-3">
          <input type="hidden" name="propertyId" value={property.id} />
          <input type="hidden" name="checkIn" value={checkIn} />
          <input type="hidden" name="checkOut" value={checkOut} />
          <input type="hidden" name="adults" value={adults} />
          <input type="hidden" name="children" value={children} />

          {/* Fechas: abre el calendario */}
          <button type="button" onClick={() => setVerCalendario((v) => !v)}
            className="flex w-full items-center gap-3 rounded-2xl bg-paper px-4 py-3 text-left hairline transition-all duration-400 hover:bg-shell/60">
            <Icon name="cal" className="h-4 w-4 shrink-0 text-palm" />
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] uppercase tracking-[0.14em] text-ink-45">Fechas</span>
              <span className="block truncate text-[14px]">
                {fechasListas
                  ? `${prettyDate(checkIn)} → ${prettyDate(checkOut)}`
                  : checkIn ? `${prettyDate(checkIn)} → elegí la salida` : "Elegí tus días"}
              </span>
            </span>
            <Icon name="arrow" className={`h-3.5 w-3.5 shrink-0 text-ink-45 transition-transform duration-400 ${verCalendario ? "-rotate-90" : "rotate-90"}`} />
          </button>

          <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${verCalendario ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">
              <div className="rounded-2xl bg-shell/50 p-3">
                <Calendar ocupados={busy} meses={1} onPick={elegir} seleccion={{ from: checkIn, to: checkOut }} />
                {checkIn && (
                  <button type="button" onClick={() => { setCheckIn(""); setCheckOut(""); }}
                    className="mt-2 w-full rounded-xl py-1.5 text-[12px] text-ink-45 transition-colors hover:text-ink">
                    Limpiar fechas
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Huespedes */}
          <div className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-2.5 hairline">
            <Icon name="users" className="h-4 w-4 shrink-0 text-palm" />
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] uppercase tracking-[0.14em] text-ink-45">Huéspedes</span>
              <span className="block text-[14px] tabular-nums">
                {guests} <span className="text-ink-45">de {property.maxGuests}</span>
              </span>
            </span>
            <Stepper value={adults} min={1} max={property.maxGuests - children} onChange={setAdults} etiqueta="adultos" />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-paper px-4 py-2.5 hairline">
            <span className="text-[13.5px] text-ink-70">Menores</span>
            <Stepper value={children} min={0} max={property.maxGuests - adults} onChange={setChildren} etiqueta="menores" />
          </div>

          {/* Detalle plegable: telefono y mensaje */}
          <button type="button" onClick={() => setVerDetalle((v) => !v)}
            className="flex w-full items-center justify-between rounded-2xl px-4 py-2 text-[12.5px] text-ink-45 transition-colors hover:text-ink">
            Agregar teléfono y mensaje
            <Icon name="arrow" className={`h-3 w-3 transition-transform duration-400 ${verDetalle ? "-rotate-90" : "rotate-90"}`} />
          </button>
          <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${verDetalle ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="space-y-2 overflow-hidden">
              <input type="tel" name="phone" placeholder="WhatsApp: +54 9 11 ..." className={`${inputCx} !py-2.5 !text-[13.5px]`} />
              <textarea name="message" rows={2} placeholder="Horario de llegada, consultas..."
                className={`${inputCx} !py-2.5 !text-[13.5px] resize-none`} />
            </div>
          </div>

          {nights > 0 && (
            <div className="space-y-1.5 rounded-2xl bg-shell/70 p-3.5 text-[13px]">
              <div className="flex justify-between text-ink-70">
                <span>{money(property.basePrice, property.currency)} × {nights} noches</span>
                <span className="tabular-nums">{money(subtotal, property.currency)}</span>
              </div>
              {property.cleaningFee > 0 && (
                <div className="flex justify-between text-ink-70">
                  <span>Limpieza final</span>
                  <span className="tabular-nums">{money(property.cleaningFee, property.currency)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-ink/10 pt-1.5 font-medium">
                <span>Estimado</span>
                <span className="tabular-nums">{money(total, property.currency)}</span>
              </div>
            </div>
          )}

          {(localError || state.error) && (
            <p className="rounded-2xl bg-[#f6e6e0] px-4 py-2.5 text-[12.5px] text-[#8a3a24]">{localError ?? state.error}</p>
          )}

          {isLogged ? (
            <ActionButton type="submit" icon="wa" variant="wa" disabled={pending || !!localError || !fechasListas}
              className="w-full justify-between">
              {pending ? "Enviando..." : "Solicitar reserva"}
            </ActionButton>
          ) : (
            <Link href="/crear-cuenta"
              className="group flex w-full items-center justify-between rounded-full bg-ink py-2 pl-5 pr-2 text-[13px] text-cream transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-palm-deep active:scale-[0.98]">
              Crear cuenta para reservar
              <span className="grid h-8 w-8 place-items-center rounded-full bg-cream/12 transition-transform duration-500 group-hover:translate-x-1">
                <Icon name="arrow" className="h-3.5 w-3.5" />
              </span>
            </Link>
          )}

          <p className="text-center text-[11px] leading-relaxed text-ink-45">
            No se cobra nada ahora. La solicitud llega al propietario por WhatsApp.
          </p>
        </form>
      </div>
    </div>
  );
}

function Stepper({
  value, min, max, onChange, etiqueta,
}: { value: number; min: number; max: number; onChange: (v: number) => void; etiqueta: string }) {
  const top = Math.max(min, max);
  const set = (v: number) => onChange(Math.min(top, Math.max(min, v)));
  const btn =
    "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[16px] leading-none hairline transition-all " +
    "duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink hover:text-cream active:scale-90 " +
    "disabled:pointer-events-none disabled:opacity-25";
  return (
    <span className="flex shrink-0 items-center gap-2">
      <button type="button" aria-label={`Restar ${etiqueta}`} onClick={() => set(value - 1)} disabled={value <= min} className={btn}>−</button>
      <span className="w-4 text-center text-[14px] tabular-nums">{value}</span>
      <button type="button" aria-label={`Sumar ${etiqueta}`} onClick={() => set(value + 1)} disabled={value >= top} className={btn}>+</button>
    </span>
  );
}
