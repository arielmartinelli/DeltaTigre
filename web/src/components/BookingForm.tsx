"use client";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { createBookingAction, type State } from "@/app/actions";
import { ActionButton } from "./Button";
import { Field, inputCx } from "./Bits";
import Icon from "./Icon";
import { money, nightsBetween, isoToday, prettyDate, rangesOverlap } from "@/lib/utils";
import type { Property } from "@/lib/data";

type Busy = { from: string; to: string; reason: string };

export default function BookingForm({
  property, busy, isLogged,
}: { property: Property; busy: Busy[]; isLogged: boolean }) {
  const [state, action, pending] = useActionState<State, FormData>(createBookingAction, {});
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(Math.min(2, property.maxGuests));
  const [children, setChildren] = useState(0);
  const guests = adults + children;

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const subtotal = nights * property.basePrice;
  const total = nights > 0 ? subtotal + property.cleaningFee : 0;

  const localError = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    if (nights < 1) return "La salida tiene que ser posterior a la entrada";
    if (nights < property.minNights) return `Estadia minima: ${property.minNights} noches`;
    if (guests > property.maxGuests) return `Máximo ${property.maxGuests} huéspedes`;
    if (busy.some((b) => rangesOverlap(checkIn, checkOut, b.from, b.to))) return "Esas fechas ya estan ocupadas";
    return null;
  }, [checkIn, checkOut, nights, guests, busy, property]);

  useEffect(() => {
    if (state.ok && state.waUrl) window.open(state.waUrl, "_blank", "noopener");
  }, [state.ok, state.waUrl]);

  if (state.ok) {
    return (
      <div className="shell">
        <div className="core px-7 py-9 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-palm-wash text-palm-deep">
            <Icon name="check" className="h-6 w-6" />
          </span>
          <h3 className="mt-5 font-display text-2xl">Solicitud enviada</h3>
          <p className="mt-3 text-[14.5px] leading-relaxed text-ink-70">
            Codigo <span className="font-medium text-ink">{state.code}</span>. Ya quedo registrada en el panel del
            propietario y en tu cuenta. Te respondemos por WhatsApp.
          </p>
          <div className="mt-7 flex flex-col gap-2.5">
            <a href={state.waUrl} target="_blank" rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-palm py-3 pl-6 pr-2 text-[13px] text-paper transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-palm-deep active:scale-[0.97]">
              Abrir WhatsApp
              <span className="grid h-8 w-8 place-items-center rounded-full bg-paper/18 transition-transform duration-500 group-hover:translate-x-1">
                <Icon name="wa" className="h-4 w-4" />
              </span>
            </a>
            <Link href="/mi-cuenta" className="ul-slide mx-auto text-[13px] text-ink-45 hover:text-ink">Ver mis reservas</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shell">
      <div className="core p-6 sm:p-7">
        <div className="flex items-baseline justify-between gap-3">
          <p>
            <span className="display text-[28px] leading-none">{money(property.basePrice, property.currency)}</span>
            <span className="ml-1.5 text-[13px] text-ink-45">/ noche</span>
          </p>
          <span className="tag bg-palm-wash text-palm-deep">min. {property.minNights} noches</span>
        </div>

        <form action={action} className="mt-6 space-y-4">
          <input type="hidden" name="propertyId" value={property.id} />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Entrada">
              <input type="date" name="checkIn" required min={isoToday()} value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)} className={inputCx} />
            </Field>
            <Field label="Salida">
              <input type="date" name="checkOut" required min={checkIn || isoToday()} value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)} className={inputCx} />
            </Field>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Adultos">
                <Stepper value={adults} min={1} max={property.maxGuests - children} onChange={setAdults} />
                <input type="hidden" name="adults" value={adults} />
              </Field>
              <Field label="Menores">
                <Stepper value={children} min={0} max={property.maxGuests - adults} onChange={setChildren} />
                <input type="hidden" name="children" value={children} />
              </Field>
            </div>
            <p className="mt-2 flex items-center justify-between text-[12px] text-ink-45">
              <span>{guests} de {property.maxGuests} huéspedes</span>
              {guests >= property.maxGuests && <span className="text-palm-deep">Capacidad máxima</span>}
            </p>
          </div>

          <Field label="WhatsApp de contacto" hint="Para responderte la solicitud">
            <input type="tel" name="phone" placeholder="+54 9 11 ..." className={inputCx} />
          </Field>

          <Field label="Mensaje (opcional)">
            <textarea name="message" rows={3} placeholder="Contanos horarios de llegada, si venis con chicos, etc."
              className={`${inputCx} resize-none`} />
          </Field>

          {nights > 0 && (
            <div className="space-y-2 rounded-2xl bg-shell/70 p-4 text-[13.5px]">
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
              <div className="flex justify-between border-t border-ink/10 pt-2 font-medium">
                <span>Estimado</span>
                <span className="tabular-nums">{money(total, property.currency)}</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-ink-45">
                Valor estimado, sujeto a confirmacion del propietario. Se abona en efectivo.
              </p>
            </div>
          )}

          {(localError || state.error) && (
            <p className="rounded-2xl bg-[#f6e6e0] px-4 py-3 text-[13px] text-[#8a3a24]">{localError ?? state.error}</p>
          )}

          {isLogged ? (
            <ActionButton type="submit" icon="wa" variant="wa" disabled={pending || !!localError}
              className="w-full justify-between">
              {pending ? "Enviando..." : "Solicitar reserva"}
            </ActionButton>
          ) : (
            <Link href="/ingresar?next=/cabanas"
              className="group flex w-full items-center justify-between rounded-full bg-ink py-2 pl-6 pr-2 text-[13px] text-cream transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-palm-deep active:scale-[0.98]">
              Crear cuenta para reservar
              <span className="grid h-8 w-8 place-items-center rounded-full bg-cream/12 transition-transform duration-500 group-hover:translate-x-1">
                <Icon name="arrow" className="h-3.5 w-3.5" />
              </span>
            </Link>
          )}

          <p className="text-center text-[11.5px] leading-relaxed text-ink-45">
            No se cobra nada ahora. La solicitud llega al propietario por WhatsApp y queda en tu cuenta.
          </p>
        </form>

        {busy.length > 0 && (
          <div className="mt-7 border-t border-ink/8 pt-5">
            <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-ink-45">
              <Icon name="cal" className="h-4 w-4 text-palm" />Fechas no disponibles
            </p>
            <ul className="mt-3 space-y-1.5 text-[13px] text-ink-70">
              {busy.slice(0, 6).map((b, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span>{prettyDate(b.from)} — {prettyDate(b.to)}</span>
                  <span className="text-[12px] text-ink-45">{b.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Stepper({
  value, min, max, onChange,
}: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  const top = Math.max(min, max);
  const set = (v: number) => onChange(Math.min(top, Math.max(min, v)));
  const btn =
    "grid h-9 w-9 shrink-0 place-items-center rounded-full text-[17px] leading-none transition-all " +
    "duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink hover:text-cream active:scale-90 " +
    "disabled:pointer-events-none disabled:opacity-25";
  return (
    <div className="flex items-center justify-between rounded-2xl bg-paper px-2 py-1.5 hairline">
      <button type="button" aria-label="Restar" onClick={() => set(value - 1)} disabled={value <= min} className={btn}>−</button>
      <span className="tabular-nums text-[15px]">{value}</span>
      <button type="button" aria-label="Sumar" onClick={() => set(value + 1)} disabled={value >= top} className={btn}>+</button>
    </div>
  );
}
