"use client";
import { useActionState, useEffect, useState } from "react";
import { replyBookingAction, deleteBookingAction, type State } from "@/app/actions";
import { StatusPill, inputCx } from "@/components/Bits";
import Icon from "@/components/Icon";
import { money, prettyDate } from "@/lib/utils";

type B = {
  id: string; code: string; guestName: string; guestEmail: string; guestPhone: string;
  checkIn: string; checkOut: string; nights: number; adults: number; children: number;
  message: string; estimate: number; status: string; ownerReply: string; createdAt: number;
};

export default function BookingRow({ b, propertyName }: { b: B; propertyName: string }) {
  const [state, action, pending] = useActionState<State, FormData>(replyBookingAction, {});
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(b.status);

  useEffect(() => { if (state.ok && state.waUrl) window.open(state.waUrl, "_blank", "noopener"); }, [state.ok, state.waUrl]);

  return (
    <div className="shell">
      <div className="core overflow-hidden">
        <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors duration-400 hover:bg-shell/50">
          <span className="hidden h-10 w-10 shrink-0 place-items-center rounded-full bg-shell text-ink-70 sm:grid">
            <Icon name="users" className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <StatusPill status={b.status} />
              <span className="text-[11.5px] tabular-nums text-ink-45">{b.code}</span>
              <span className="text-[11.5px] text-ink-45">· {propertyName}</span>
            </span>
            <span className="mt-1.5 block truncate text-[15px] font-medium">{b.guestName}</span>
            <span className="mt-0.5 block text-[13px] text-ink-45">
              {prettyDate(b.checkIn)} → {prettyDate(b.checkOut)} · {b.nights} noches · {b.adults + b.children} huéspedes
            </span>
          </span>
          <span className="hidden shrink-0 text-right sm:block">
            <span className="display block text-[19px]">{money(b.estimate)}</span>
          </span>
          <Icon name="arrow" className={`h-4 w-4 shrink-0 text-ink-45 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "-rotate-90" : "rotate-90"}`} />
        </button>

        <div className={`grid transition-all duration-600 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <div className="space-y-5 border-t border-ink/8 px-5 py-5">
              <dl className="grid gap-x-8 gap-y-3 text-[13.5px] sm:grid-cols-2">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-ink-45">WhatsApp</dt>
                  <dd className="mt-1">{b.guestPhone || <span className="text-ink-45">sin teléfono</span>}</dd>
                </div>
                <div><dt className="text-[11px] uppercase tracking-[0.14em] text-ink-45">Solicitada</dt><dd className="mt-1">{new Date(b.createdAt).toLocaleString("es-AR")}</dd></div>
                <div><dt className="text-[11px] uppercase tracking-[0.14em] text-ink-45">Estimado</dt><dd className="mt-1">{money(b.estimate)}</dd></div>
              </dl>

              {b.message && (
                <p className="rounded-xl bg-shell/80 px-4 py-3 text-[13.5px] leading-relaxed text-ink-70">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-ink-45">Mensaje del huésped</span><br />{b.message}
                </p>
              )}

              <form action={action} className="space-y-3">
                <input type="hidden" name="id" value={b.id} />
                <div className="flex flex-wrap gap-2">
                  {["confirmada", "rechazada", "pendiente", "cancelada"].map((s) => (
                    <label key={s} className={`cursor-pointer rounded-full px-4 py-2 text-[12.5px] capitalize transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]
                      ${status === s ? "bg-ink text-cream" : "bg-paper hairline text-ink-70 hover:bg-shell"}`}>
                      <input type="radio" name="status" value={s} checked={status === s}
                        onChange={() => setStatus(s)} className="sr-only" />
                      {s}
                    </label>
                  ))}
                </div>
                <textarea name="ownerReply" rows={2} defaultValue={b.ownerReply}
                  placeholder="Mensaje para el huésped (se envía por WhatsApp y aparece en su cuenta)"
                  className={`${inputCx} resize-none`} />

                {state.error && <p className="rounded-xl bg-[#f6e6e0] px-4 py-2.5 text-[13px] text-[#8a3a24]">{state.error}</p>}
                {state.ok && <p className="rounded-xl bg-palm-wash px-4 py-2.5 text-[13px] text-palm-deep">{state.message}</p>}

                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" disabled={pending}
                    className="group inline-flex items-center gap-3 rounded-full bg-palm py-2 pl-5 pr-2 text-[13px] text-paper transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-palm-deep active:scale-[0.97] disabled:opacity-40">
                    {pending ? "Guardando..." : "Guardar y avisar"}
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-paper/18 transition-transform duration-500 group-hover:translate-x-1">
                      <Icon name="wa" className="h-4 w-4" />
                    </span>
                  </button>
                  {!b.guestPhone && <span className="text-[12px] text-ink-45">Sin teléfono cargado: solo se guarda el estado.</span>}
                </div>
              </form>

              <form action={deleteBookingAction} className="border-t border-ink/8 pt-4">
                <input type="hidden" name="id" value={b.id} />
                <button className="inline-flex items-center gap-1.5 text-[12.5px] text-[#8a3a24] transition-opacity hover:opacity-70">
                  <Icon name="trash" className="h-3.5 w-3.5" />Eliminar esta reserva
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
