"use client";
import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/Icon";
import { money } from "@/lib/utils";

type Fila = { monThu: number; fri: number; satSun: number };
const VACIA: Fila = { monThu: 0, fri: 0, satSun: 0 };

/**
 * Precios generales: por día de la semana y por cantidad de huéspedes.
 * Los campos viven siempre en el DOM (la ventana se oculta con CSS) para que
 * sigan formando parte del formulario del alojamiento.
 */
export default function PreciosDialog({
  monThu, fri, satSun, cleaningFee, minNights, maxGuests, porPersona,
}: {
  monThu: number; fri: number; satSun: number;
  cleaningFee: number; minNights: number; maxGuests: number;
  porPersona: Record<number, Fila>;
}) {
  const [abierto, setAbierto] = useState(false);
  const [gen, setGen] = useState({ monThu, fri, satSun, cleaningFee, minNights });
  const [tabla, setTabla] = useState<Record<number, Fila>>(() => {
    const t: Record<number, Fila> = {};
    for (let n = 1; n <= maxGuests; n++) t[n] = porPersona[n] ?? { ...VACIA };
    return t;
  });
  const [autoBase, setAutoBase] = useState(gen.monThu || 0);
  const [autoExtra, setAutoExtra] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setAbierto(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const cargados = useMemo(
    () => Object.values(tabla).filter((f) => f.monThu || f.fri || f.satSun).length,
    [tabla]
  );

  const desde = useMemo(() => {
    const v = [gen.monThu, gen.fri, gen.satSun,
      ...Object.values(tabla).flatMap((f) => [f.monThu, f.fri, f.satSun])].filter((n) => n > 0);
    return v.length ? Math.min(...v) : 0;
  }, [gen, tabla]);

  const setGenCampo = (k: keyof typeof gen) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setGen((s) => ({ ...s, [k]: Number(e.target.value) || 0 }));

  const setCelda = (n: number, k: keyof Fila, valor: string) =>
    setTabla((t) => ({ ...t, [n]: { ...t[n], [k]: Number(valor) || 0 } }));

  /** Completa la tabla: precio para 1 persona + un adicional por cada persona de más. */
  const autocompletar = () => {
    const prop = gen.monThu ? { fri: gen.fri / gen.monThu, sat: gen.satSun / gen.monThu } : { fri: 1, sat: 1 };
    setTabla(() => {
      const t: Record<number, Fila> = {};
      for (let n = 1; n <= maxGuests; n++) {
        const base = autoBase + autoExtra * (n - 1);
        t[n] = {
          monThu: Math.round(base / 1000) * 1000,
          fri: Math.round((base * prop.fri) / 1000) * 1000,
          satSun: Math.round((base * prop.sat) / 1000) * 1000,
        };
      }
      return t;
    });
  };

  const limpiarTabla = () =>
    setTabla(() => {
      const t: Record<number, Fila> = {};
      for (let n = 1; n <= maxGuests; n++) t[n] = { ...VACIA };
      return t;
    });

  const campo =
    "w-full rounded-xl bg-paper px-3 py-2 text-[13.5px] tabular-nums hairline outline-none transition-all " +
    "duration-300 focus:shadow-[0_0_0_3px_rgba(92,140,60,0.16)]";
  const campoGrande = campo.replace("px-3 py-2 text-[13.5px]", "px-4 py-3 text-[15px]").replace("rounded-xl", "rounded-2xl");

  return (
    <>
      {/* Resumen clickeable */}
      <button type="button" onClick={() => setAbierto(true)}
        className="group flex w-full items-center gap-4 rounded-2xl bg-paper px-5 py-4 text-left hairline transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-28px_rgba(16,18,14,0.55)]">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-palm-wash text-palm-deep transition-transform duration-500 group-hover:scale-105">
          <Icon name="cash" className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-medium">Precios por noche</span>
          <span className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[12.5px] text-ink-45">
            <span>L a J {money(gen.monThu)}</span>
            <span>· V {money(gen.fri)}</span>
            <span>· S y D {money(gen.satSun)}</span>
            {cargados > 0 && <span>· {cargados} tramos por huéspedes</span>}
          </span>
        </span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink/6 transition-all duration-500 group-hover:bg-ink group-hover:text-cream">
          <Icon name="edit" className="h-4 w-4" />
        </span>
      </button>

      {/* Ventana flotante — siempre montada */}
      <div aria-hidden={!abierto}
        className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] sm:items-center sm:p-6
          ${abierto ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        <div onClick={() => setAbierto(false)} className="absolute inset-0 bg-ink/45 backdrop-blur-sm" />

        <div className={`relative w-full max-w-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${abierto ? "translate-y-0 scale-100" : "translate-y-6 scale-[0.98]"}`}>
          <div className="shell !p-1.5">
            <div className="core max-h-[88dvh] overflow-y-auto p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="tag bg-palm-wash text-palm-deep">
                    <span className="h-1 w-1 rounded-full bg-palm" />Tarifa general
                  </span>
                  <h3 className="mt-3 font-display text-[26px] leading-none">Precios por noche</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-45">
                    Primero el precio según el día de la semana. Después, si querés, un valor
                    distinto para cada cantidad de huéspedes.
                  </p>
                </div>
                <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink/6 transition-all duration-400 hover:rotate-90 hover:bg-ink hover:text-cream">
                  <Icon name="close" className="h-4 w-4" />
                </button>
              </div>

              {/* --- 1. Por día de la semana --- */}
              <p className="mt-7 text-[11px] uppercase tracking-[0.16em] text-ink-45">1 · Según el día</p>
              <div className="mt-3 space-y-2.5">
                {([["monThu", "Lunes a jueves"], ["fri", "Viernes"], ["satSun", "Sábado y domingo"]] as const)
                  .map(([k, titulo]) => (
                    <label key={k} className="flex items-center gap-4 rounded-2xl bg-shell/50 p-3">
                      <span className="min-w-0 flex-1 pl-1 text-[14px] font-medium">{titulo}</span>
                      <span className="relative w-[46%] shrink-0">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-ink-45">$</span>
                        <input name={`price${k === "monThu" ? "MonThu" : k === "fri" ? "Fri" : "SatSun"}`}
                          type="number" min={0} step={1000} value={gen[k]} onChange={setGenCampo(k)}
                          className={`${campoGrande} !pl-8`} />
                      </span>
                    </label>
                  ))}
              </div>

              {/* --- 2. Por cantidad de huespedes --- */}
              <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[11px] uppercase tracking-[0.16em] text-ink-45">2 · Según cuántos sean</p>
                <button type="button" onClick={limpiarTabla}
                  className="ul-slide text-[12px] text-ink-45 transition-colors hover:text-ink">Vaciar tabla</button>
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-45">
                Los tramos vacíos usan el precio de arriba. Cargá solo los que cobres distinto.
              </p>

              <div className="mt-3 flex flex-wrap items-end gap-2 rounded-2xl bg-palm-wash/40 p-3">
                <label className="min-w-[120px] flex-1">
                  <span className="mb-1 block text-[11px] text-palm-deep">1 persona</span>
                  <input type="number" min={0} step={1000} value={autoBase}
                    onChange={(e) => setAutoBase(Number(e.target.value) || 0)} className={campo} />
                </label>
                <label className="min-w-[120px] flex-1">
                  <span className="mb-1 block text-[11px] text-palm-deep">Por persona extra</span>
                  <input type="number" min={0} step={1000} value={autoExtra}
                    onChange={(e) => setAutoExtra(Number(e.target.value) || 0)} className={campo} />
                </label>
                <button type="button" onClick={autocompletar}
                  className="rounded-full bg-palm-deep px-4 py-2 text-[12.5px] text-paper transition-all duration-400 hover:bg-palm active:scale-95">
                  Completar tabla
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[420px] border-separate border-spacing-y-1.5">
                  <thead>
                    <tr className="text-[10.5px] uppercase tracking-[0.12em] text-ink-45">
                      <th className="w-20 pb-1 text-left font-normal">Huésp.</th>
                      <th className="pb-1 text-left font-normal">Lun a jue</th>
                      <th className="pb-1 text-left font-normal">Viernes</th>
                      <th className="pb-1 text-left font-normal">Sáb y dom</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                      <tr key={n}>
                        <td className="pr-2">
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-shell text-[13px] tabular-nums">{n}</span>
                        </td>
                        {(["monThu", "fri", "satSun"] as const).map((k) => (
                          <td key={k} className="pr-2">
                            <input name={`gp_${n}_${k}`} type="number" min={0} step={1000}
                              value={tabla[n]?.[k] || ""} placeholder="—"
                              onChange={(e) => setCelda(n, k, e.target.value)}
                              className={campo} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* --- 3. Extras --- */}
              <div className="mt-7 grid gap-3 border-t border-ink/8 pt-6 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-ink-45">Limpieza final</span>
                  <input name="cleaningFee" type="number" min={0} step={1000}
                    value={gen.cleaningFee} onChange={setGenCampo("cleaningFee")} className={campoGrande} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-ink-45">Noches mínimas</span>
                  <input name="minNights" type="number" min={1}
                    value={gen.minNights} onChange={setGenCampo("minNights")} className={campoGrande} />
                </label>
              </div>

              <p className="mt-6 rounded-2xl bg-palm-wash/50 px-4 py-3 text-[12.5px] leading-relaxed text-palm-deep">
                El sitio muestra <span className="font-medium">«desde {money(desde)}»</span> y cotiza
                cada noche según el día que caiga y cuántos sean.
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
