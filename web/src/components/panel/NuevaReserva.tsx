"use client";
import { useActionState, useState } from "react";
import { createManualBookingAction, type State } from "@/app/actions";
import { inputCx, Field } from "@/components/Bits";
import Icon from "@/components/Icon";
import { isoToday, nightsBetween, money, quoteStay } from "@/lib/utils";

type Casa = { id: string; name: string; maxGuests: number; basePrice: number; cleaningFee: number; minNights: number };

/** Carga manual de una reserva. Al confirmarla, esas fechas se cierran en el sitio. */
export default function NuevaReserva({
  casas, rates,
}: { casas: Casa[]; rates: Record<string, Record<string, number>> }) {
  const [state, action, pending] = useActionState<State, FormData>(createManualBookingAction, {});
  const [abierto, setAbierto] = useState(false);
  const [propertyId, setPropertyId] = useState(casas[0]?.id ?? "");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const casa = casas.find((c) => c.id === propertyId);
  const noches = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const sugerido = casa && noches > 0
    ? quoteStay(checkIn, checkOut, casa.basePrice, rates[casa.id] ?? {}, casa.cleaningFee).total
    : 0;

  if (state.ok && !abierto) {
    // se cerro el panel despues de guardar
  }

  return (
    <div className="shell">
      <div className="core overflow-hidden">
        <button onClick={() => setAbierto((v) => !v)}
          className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition-colors duration-400 hover:bg-shell/50">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-palm-wash text-palm-deep">
            <Icon name="plus" className="h-4.5 w-4.5" />
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-medium">Cargar una reserva</span>
            <span className="block text-[12.5px] text-ink-45">
              Al confirmarla, esas fechas se cierran solas en el calendario del sitio
            </span>
          </span>
          <Icon name="arrow" className={`h-4 w-4 text-ink-45 transition-transform duration-500 ${abierto ? "-rotate-90" : "rotate-90"}`} />
        </button>

        <div className={`grid transition-all duration-600 ease-[cubic-bezier(0.32,0.72,0,1)] ${abierto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <form action={action} className="space-y-4 border-t border-ink/8 px-5 py-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Alojamiento">
                  <select name="propertyId" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className={inputCx}>
                    {casas.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Estado">
                  <select name="status" defaultValue="confirmada" className={inputCx}>
                    <option value="confirmada">Confirmada — cierra las fechas</option>
                    <option value="pendiente">Pendiente — no cierra las fechas</option>
                  </select>
                </Field>

                <Field label="Nombre del huésped">
                  <input name="guestName" required placeholder="Ana Gómez" className={inputCx} />
                </Field>
                <Field label="WhatsApp" hint="Para poder escribirle después">
                  <input name="guestPhone" type="tel" placeholder="+54 9 11 ..." className={inputCx} />
                </Field>

                <Field label="Entrada">
                  <input name="checkIn" type="date" required value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)} className={inputCx} />
                </Field>
                <Field label="Salida">
                  <input name="checkOut" type="date" required min={checkIn || isoToday()} value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)} className={inputCx} />
                </Field>

                <Field label="Adultos">
                  <input name="adults" type="number" min={1} max={casa?.maxGuests ?? 20} defaultValue={2} className={inputCx} />
                </Field>
                <Field label="Menores">
                  <input name="children" type="number" min={0} max={casa?.maxGuests ?? 20} defaultValue={0} className={inputCx} />
                </Field>

                <Field label="Monto total"
                  hint={sugerido ? `Sugerido por tarifas: ${money(sugerido)}` : "Se calcula solo si lo dejás vacío"}>
                  <input name="estimate" type="number" min={0} placeholder={sugerido ? String(sugerido) : "0"} className={inputCx} />
                </Field>
                <Field label="Noches">
                  <input value={noches || ""} readOnly placeholder="—" className={`${inputCx} !bg-shell/60`} />
                </Field>
              </div>

              <Field label="Nota interna">
                <textarea name="message" rows={2} placeholder="Seña abonada, horario de llegada, etc."
                  className={`${inputCx} resize-none`} />
              </Field>

              {state.error && <p className="rounded-2xl bg-[#f6e6e0] px-4 py-2.5 text-[13px] text-[#8a3a24]">{state.error}</p>}
              {state.ok && <p className="rounded-2xl bg-palm-wash px-4 py-2.5 text-[13px] text-palm-deep">{state.message}</p>}

              <button type="submit" disabled={pending}
                className="group inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-[13px] text-cream transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-palm-deep active:scale-[0.97] disabled:opacity-40">
                {pending ? "Guardando..." : "Guardar reserva"}
                <span className="grid h-8 w-8 place-items-center rounded-full bg-cream/12 transition-transform duration-500 group-hover:translate-x-1">
                  <Icon name="check" className="h-3.5 w-3.5" />
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
