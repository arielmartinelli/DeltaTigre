"use client";
import { useMemo, useState } from "react";
import Icon from "./Icon";
import { inputCx } from "./Bits";
import Calendar, { type Ocupacion } from "./Calendar";
import { money, prettyDate, rangesOverlap, quoteStay, precioDesde } from "@/lib/utils";
import type { PreciosPorPersona } from "@/lib/utils";
import { waLink, consultaMessage } from "@/lib/whatsapp";
import type { Property } from "@/lib/data";

/**
 * Consulta de disponibilidad sin cuentas: se arma el mensaje y se abre WhatsApp.
 * No escribe nada en la base.
 */
export default function ConsultaForm({
  property, busy, rates, porPersona, whatsapp,
}: {
  property: Property; busy: Ocupacion[]; rates: Record<string, number>;
  porPersona: PreciosPorPersona; whatsapp: string;
}) {
  const [nombre, setNombre] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(Math.min(2, property.maxGuests));
  const [children, setChildren] = useState(0);
  const [verCalendario, setVerCalendario] = useState(false);

  const guests = adults + children;
  const listo = !!(nombre.trim().length >= 2 && checkIn && checkOut);

  const cotizacion = useMemo(
    () => (checkIn && checkOut
      ? quoteStay(checkIn, checkOut, property, rates, property.cleaningFee, guests, porPersona)
      : null),
    [checkIn, checkOut, rates, property, guests, porPersona]
  );

  const error = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    if (!cotizacion || cotizacion.nights < 1) return "La salida tiene que ser posterior a la entrada";
    if (cotizacion.nights < property.minNights) return `Estadía mínima: ${property.minNights} noches`;
    if (guests > property.maxGuests) return `Máximo ${property.maxGuests} huéspedes`;
    if (busy.some((b) => rangesOverlap(checkIn, checkOut, b.from, b.to))) return "Esas fechas ya están ocupadas";
    return null;
  }, [checkIn, checkOut, cotizacion, guests, busy, property]);

  const elegir = (fecha: string) => {
    if (!checkIn || (checkIn && checkOut) || fecha <= checkIn) {
      setCheckIn(fecha); setCheckOut("");
    } else {
      setCheckOut(fecha); setVerCalendario(false);
    }
  };

  const enlace = listo && !error && cotizacion
    ? waLink(whatsapp, consultaMessage({
        nombre: nombre.trim(),
        alojamiento: property.name,
        checkIn: prettyDate(checkIn),
        checkOut: prettyDate(checkOut),
        nights: cotizacion.nights,
        adults, children,
        estimado: money(cotizacion.total, property.currency),
      }))
    : null;

  const desde = precioDesde(property, rates, porPersona);

  return (
    <div className="shell">
      <div className="core p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p>
            <span className="text-[12px] text-ink-45">desde </span>
            <span className="display text-[24px] leading-none">{money(desde, property.currency)}</span>
            <span className="ml-1.5 text-[12.5px] text-ink-45">/ noche</span>
          </p>
          <span className="tag bg-palm-wash text-palm-deep">mín. {property.minNights} noches</span>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-2.5 hairline focus-within:shadow-[0_0_0_3px_rgba(92,140,60,0.16)]">
            <Icon name="users" className="h-4 w-4 shrink-0 text-palm" />
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] uppercase tracking-[0.14em] text-ink-45">Tu nombre</span>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="¿Cómo te llamás?"
                className="w-full border-0 bg-transparent p-0 text-[14px] outline-none placeholder:text-ink-45/60" />
            </span>
          </label>

          <button type="button" onClick={() => setVerCalendario((v) => !v)}
            className="flex w-full items-center gap-3 rounded-2xl bg-paper px-4 py-3 text-left hairline transition-all duration-400 hover:bg-shell/60">
            <Icon name="cal" className="h-4 w-4 shrink-0 text-palm" />
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] uppercase tracking-[0.14em] text-ink-45">Fechas</span>
              <span className="block truncate text-[14px]">
                {checkIn && checkOut
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

          <div className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-2.5 hairline">
            <Icon name="family" className="h-4 w-4 shrink-0 text-palm" />
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] uppercase tracking-[0.14em] text-ink-45">Adultos</span>
              <span className="block text-[14px] tabular-nums">{guests} <span className="text-ink-45">de {property.maxGuests}</span></span>
            </span>
            <Stepper value={adults} min={1} max={property.maxGuests - children} onChange={setAdults} etiqueta="adultos" />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-paper px-4 py-2.5 hairline">
            <span className="text-[13.5px] text-ink-70">Menores</span>
            <Stepper value={children} min={0} max={property.maxGuests - adults} onChange={setChildren} etiqueta="menores" />
          </div>

          {cotizacion && cotizacion.nights > 0 && (
            <div className="space-y-1.5 rounded-2xl bg-shell/70 p-3.5 text-[13px]">
              <div className="flex justify-between text-ink-70">
                <span>
                  {cotizacion.nights} noche{cotizacion.nights > 1 ? "s" : ""}
                  <span className="text-ink-45"> · {guests} huésped{guests > 1 ? "es" : ""}</span>
                </span>
                <span className="tabular-nums">{money(cotizacion.subtotal, property.currency)}</span>
              </div>
              {property.cleaningFee > 0 && (
                <div className="flex justify-between text-ink-70">
                  <span>Limpieza final</span>
                  <span className="tabular-nums">{money(property.cleaningFee, property.currency)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-ink/10 pt-1.5 font-medium">
                <span>Estimado</span>
                <span className="tabular-nums">{money(cotizacion.total, property.currency)}</span>
              </div>
            </div>
          )}

          {error && <p className="rounded-2xl bg-[#f6e6e0] px-4 py-2.5 text-[12.5px] text-[#8a3a24]">{error}</p>}

          {enlace ? (
            <a href={enlace} target="_blank" rel="noopener noreferrer"
              className="group flex w-full items-center justify-between rounded-full bg-palm py-2 pl-5 pr-2 text-[13px] text-paper transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-palm-deep active:scale-[0.98]">
              Consultar disponibilidad
              <span className="grid h-8 w-8 place-items-center rounded-full bg-paper/18 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-px">
                <Icon name="wa" className="h-4 w-4" />
              </span>
            </a>
          ) : (
            <span className="flex w-full items-center justify-between rounded-full bg-ink/10 py-2 pl-5 pr-2 text-[13px] text-ink-45">
              {!nombre.trim() ? "Escribí tu nombre" : !checkIn || !checkOut ? "Elegí tus fechas" : "Revisá las fechas"}
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink/5">
                <Icon name="wa" className="h-4 w-4" />
              </span>
            </span>
          )}

          <p className="text-center text-[11px] leading-relaxed text-ink-45">
            Se abre WhatsApp con el mensaje ya escrito. No se cobra nada por consultar.
          </p>
        </div>
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
