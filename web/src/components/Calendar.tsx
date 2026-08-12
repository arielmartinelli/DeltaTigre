"use client";
import { useMemo, useState } from "react";
import Icon from "./Icon";

export type Ocupacion = { from: string; to: string; reason: string; guest?: string; code?: string };

const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const DIAS = ["L","M","M","J","V","S","D"];

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Expande los rangos ocupados a un mapa dia -> motivo. La salida queda libre. */
function expandir(rangos: Ocupacion[]) {
  const mapa = new Map<string, Ocupacion>();
  for (const r of rangos) {
    const d = new Date(r.from + "T00:00:00");
    const fin = new Date(r.to + "T00:00:00");
    while (d < fin) {
      mapa.set(iso(d), r);
      d.setDate(d.getDate() + 1);
    }
  }
  return mapa;
}

function grilla(anio: number, mes: number) {
  const primero = new Date(anio, mes, 1);
  const offset = (primero.getDay() + 6) % 7; // lunes primero
  const dias = new Date(anio, mes + 1, 0).getDate();
  const celdas: (Date | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= dias; d++) celdas.push(new Date(anio, mes, d));
  while (celdas.length % 7 !== 0) celdas.push(null);
  return celdas;
}

export default function Calendar({
  ocupados, meses = 2, onPick, seleccion,
}: {
  ocupados: Ocupacion[];
  meses?: number;
  onPick?: (fecha: string) => void;
  seleccion?: { from?: string; to?: string };
}) {
  const hoy = new Date();
  const [cursor, setCursor] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const mapa = useMemo(() => expandir(ocupados), [ocupados]);
  const hoyIso = iso(hoy);

  const mover = (n: number) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + n, 1));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={() => mover(-1)} aria-label="Mes anterior"
          className="grid h-9 w-9 place-items-center rounded-full hairline transition-all duration-400 hover:bg-ink hover:text-cream active:scale-90">
          <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" />
        </button>
        <p className="text-[13px] uppercase tracking-[0.14em] text-ink-45">
          {MESES[cursor.getMonth()]} {cursor.getFullYear()}
        </p>
        <button type="button" onClick={() => mover(1)} aria-label="Mes siguiente"
          className="grid h-9 w-9 place-items-center rounded-full hairline transition-all duration-400 hover:bg-ink hover:text-cream active:scale-90">
          <Icon name="arrow" className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className={`grid gap-6 ${meses > 1 ? "sm:grid-cols-2" : ""}`}>
        {Array.from({ length: meses }).map((_, m) => {
          const fecha = new Date(cursor.getFullYear(), cursor.getMonth() + m, 1);
          const celdas = grilla(fecha.getFullYear(), fecha.getMonth());
          return (
            <div key={m} className={m > 0 ? "hidden sm:block" : ""}>
              {meses > 1 && (
                <p className="mb-2 text-center text-[12px] capitalize text-ink-45 sm:text-left">
                  {MESES[fecha.getMonth()]} {fecha.getFullYear()}
                </p>
              )}
              <div className="grid grid-cols-7 gap-1 text-center">
                {DIAS.map((d, i) => (
                  <span key={i} className="pb-1 text-[10px] uppercase tracking-wider text-ink-45/60">{d}</span>
                ))}
                {celdas.map((d, i) => {
                  if (!d) return <span key={i} />;
                  const k = iso(d);
                  const ocupado = mapa.get(k);
                  const pasado = k < hoyIso;
                  const esHoy = k === hoyIso;
                  const enRango = seleccion?.from && seleccion?.to && k >= seleccion.from && k < seleccion.to;
                  const punta = k === seleccion?.from || k === seleccion?.to;

                  const base = "relative grid h-9 place-items-center rounded-lg text-[13px] tabular-nums transition-all duration-300";
                  let cls = "text-ink-70 hover:bg-ink/6";
                  if (pasado) cls = "text-ink-45/30";
                  if (ocupado) cls = "bg-[#f3e2dd] text-[#8a3a24]/70 line-through";
                  if (enRango) cls = "bg-palm-wash text-palm-deep";
                  if (punta) cls = "bg-palm text-paper";

                  return (
                    <button key={i} type="button"
                      disabled={pasado || !!ocupado || !onPick}
                      onClick={() => onPick?.(k)}
                      title={ocupado ? `${ocupado.reason}${ocupado.guest ? " — " + ocupado.guest : ""}` : undefined}
                      className={`${base} ${cls} ${onPick && !pasado && !ocupado ? "cursor-pointer" : "cursor-default"}`}>
                      {d.getDate()}
                      {esHoy && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-palm" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-ink-45">
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[#f3e2dd]" />Ocupado</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-palm" />Tu selección</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-palm" />Hoy</span>
      </div>
    </div>
  );
}
