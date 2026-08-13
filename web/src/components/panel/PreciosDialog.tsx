"use client";
import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { money } from "@/lib/utils";

/**
 * Precios generales por día de la semana.
 * Los campos viven siempre en el DOM (la ventana se oculta con CSS, no se desmonta)
 * para que sigan formando parte del formulario del alojamiento.
 */
export default function PreciosDialog({
  monThu, fri, satSun, cleaningFee, minNights,
}: { monThu: number; fri: number; satSun: number; cleaningFee: number; minNights: number }) {
  const [abierto, setAbierto] = useState(false);
  const [v, setV] = useState({ monThu, fri, satSun, cleaningFee, minNights });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setAbierto(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setV((s) => ({ ...s, [k]: Number(e.target.value) || 0 }));

  const filas: [keyof typeof v, string, string, string][] = [
    ["monThu", "priceMonThu", "Lunes a jueves", "Noches de semana"],
    ["fri", "priceFri", "Viernes", "Arranque del fin de semana"],
    ["satSun", "priceSatSun", "Sábado y domingo", "Fin de semana"],
  ];

  const campo =
    "w-full rounded-2xl bg-paper px-4 py-3 text-[15px] tabular-nums hairline outline-none transition-all " +
    "duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] focus:shadow-[0_0_0_3px_rgba(92,140,60,0.16)]";

  return (
    <>
      {/* Resumen clickeable */}
      <button type="button" onClick={() => setAbierto(true)}
        className="group flex w-full items-center gap-4 rounded-2xl bg-paper px-5 py-4 text-left hairline transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-28px_rgba(16,18,14,0.55)]">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-palm-wash text-palm-deep transition-transform duration-500 group-hover:scale-105">
          <Icon name="cash" className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-medium">Precios por día de la semana</span>
          <span className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[12.5px] text-ink-45">
            <span>L a J {money(v.monThu)}</span>
            <span>· V {money(v.fri)}</span>
            <span>· S y D {money(v.satSun)}</span>
          </span>
        </span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink/6 transition-all duration-500 group-hover:bg-ink group-hover:text-cream">
          <Icon name="edit" className="h-4 w-4" />
        </span>
      </button>

      {/* Ventana flotante — siempre montada */}
      <div
        aria-hidden={!abierto}
        className={`fixed inset-0 z-50 flex items-end justify-center p-0 transition-opacity duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] sm:items-center sm:p-6
          ${abierto ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div onClick={() => setAbierto(false)} className="absolute inset-0 bg-ink/45 backdrop-blur-sm" />

        <div
          className={`relative w-full max-w-lg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${abierto ? "translate-y-0 scale-100" : "translate-y-6 scale-[0.98]"}`}
        >
          <div className="shell !p-1.5">
            <div className="core max-h-[85dvh] overflow-y-auto p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="tag bg-palm-wash text-palm-deep">
                    <span className="h-1 w-1 rounded-full bg-palm" />Tarifa general
                  </span>
                  <h3 className="mt-3 font-display text-[26px] leading-none">Precios por noche</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-45">
                    Se aplican a todo el año. Para fechas puntuales —feriados, temporada alta— usá
                    las tarifas especiales en <span className="text-ink">Fechas disponibles</span>.
                  </p>
                </div>
                <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink/6 transition-all duration-400 hover:rotate-90 hover:bg-ink hover:text-cream">
                  <Icon name="close" className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-7 space-y-3">
                {filas.map(([k, name, titulo, ayuda]) => (
                  <label key={name} className="flex items-center gap-4 rounded-2xl bg-shell/50 p-3">
                    <span className="min-w-0 flex-1 pl-1">
                      <span className="block text-[14px] font-medium">{titulo}</span>
                      <span className="block text-[11.5px] text-ink-45">{ayuda}</span>
                    </span>
                    <span className="relative w-[46%] shrink-0">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-ink-45">$</span>
                      <input name={name} type="number" min={0} step={1000} value={v[k]} onChange={set(k)}
                        className={`${campo} !pl-8`} />
                    </span>
                  </label>
                ))}
              </div>

              <div className="mt-6 grid gap-3 border-t border-ink/8 pt-6 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-ink-45">Limpieza final</span>
                  <input name="cleaningFee" type="number" min={0} step={1000}
                    value={v.cleaningFee} onChange={set("cleaningFee")} className={campo} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-ink-45">Noches mínimas</span>
                  <input name="minNights" type="number" min={1}
                    value={v.minNights} onChange={set("minNights")} className={campo} />
                </label>
              </div>

              <p className="mt-6 rounded-2xl bg-palm-wash/50 px-4 py-3 text-[12.5px] leading-relaxed text-palm-deep">
                El sitio muestra <span className="font-medium">«desde {money(Math.min(...[v.monThu, v.fri, v.satSun].filter((n) => n > 0)) || 0)}»</span> y
                cotiza cada noche por separado según el día que caiga.
              </p>

              <button type="button" onClick={() => setAbierto(false)}
                className="mt-6 w-full rounded-full bg-ink py-3 text-[13px] text-cream transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-palm-deep active:scale-[0.98]">
                Listo — acordate de guardar los cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
