"use client";
import { useActionState } from "react";
import { setRateRangeAction, deleteRateAction, clearRatesAction, type State } from "@/app/actions";
import { inputCx } from "@/components/Bits";
import Icon from "@/components/Icon";
import { money, prettyDate, isoToday } from "@/lib/utils";

type Fila = { id: string; day: string; price: number };

/** Precio por día: se fija por rango y se puede quitar día por día. */
export default function Tarifas({
  propertyId, basePrice, filas,
}: { propertyId: string; basePrice: number; filas: Fila[] }) {
  const [state, action, pending] = useActionState<State, FormData>(setRateRangeAction, {});
  const futuras = filas.filter((f) => f.day >= isoToday());

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.16em] text-ink-45">Tarifas especiales</p>
        <p className="text-[12px] text-ink-45">
          Desde: <span className="font-medium text-ink">{money(basePrice)}</span>
        </p>
      </div>
      <p className="mt-2 text-[12.5px] leading-relaxed text-ink-45">
        Pisan el precio general de la semana en fechas puntuales: feriados, Semana Santa,
        temporada alta. Los días sin tarifa especial usan el precio del día que corresponda.
      </p>

      <form action={action} className="mt-3 grid gap-2 sm:grid-cols-2">
        <input type="hidden" name="propertyId" value={propertyId} />
        <input type="date" name="fromDate" required className={`${inputCx} !py-2.5 !text-[13.5px]`} />
        <input type="date" name="toDate" required className={`${inputCx} !py-2.5 !text-[13.5px]`} />
        <input type="number" name="price" required min={1} placeholder={`Precio por noche (ej. ${basePrice})`}
          className={`${inputCx} !py-2.5 !text-[13.5px] sm:col-span-2`} />
        <button type="submit" disabled={pending}
          className="rounded-full bg-ink px-4 py-2.5 text-[13px] text-cream transition-all duration-400 hover:bg-palm-deep active:scale-[0.97] disabled:opacity-40 sm:col-span-2">
          {pending ? "Aplicando..." : "Aplicar a estas fechas"}
        </button>
      </form>

      {state.error && <p className="mt-2 rounded-xl bg-[#f6e6e0] px-3.5 py-2 text-[12.5px] text-[#8a3a24]">{state.error}</p>}
      {state.ok && <p className="mt-2 rounded-xl bg-palm-wash px-3.5 py-2 text-[12.5px] text-palm-deep">{state.message}</p>}

      {futuras.length > 0 && (
        <>
          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink-45">
              {futuras.length} día(s) con precio especial
            </p>
            <form action={clearRatesAction}>
              <input type="hidden" name="propertyId" value={propertyId} />
              <button className="ul-slide text-[12px] text-ink-45 transition-colors hover:text-ink">Borrar todas</button>
            </form>
          </div>
          <ul className="no-scrollbar mt-3 max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {futuras.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 rounded-xl bg-shell/70 px-3.5 py-2 text-[13px]">
                <span>{prettyDate(f.day)}</span>
                <span className="ml-auto tabular-nums font-medium">{money(f.price)}</span>
                <form action={deleteRateAction}>
                  <input type="hidden" name="id" value={f.id} />
                  <button aria-label="Quitar tarifa" className="transition-opacity hover:opacity-60">
                    <Icon name="trash" className="h-3.5 w-3.5 text-[#8a3a24]" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
