"use client";
import { useActionState } from "react";
import type { State } from "@/app/actions";
import Icon from "@/components/Icon";

/**
 * Formulario con barra de guardado pegada al pie del area visible:
 * siempre a la vista, sin tener que bajar hasta el final.
 */
export default function SaveForm({
  action, children, label = "Guardar cambios", className = "", sticky = true,
}: {
  action: (prev: State, form: FormData) => Promise<State>;
  children: React.ReactNode; label?: string; className?: string; sticky?: boolean;
}) {
  const [state, formAction, pending] = useActionState<State, FormData>(action, {});

  return (
    <form action={formAction} className={className}>
      {children}

      <div className={sticky
        ? "sticky bottom-4 z-20 mt-7 flex flex-wrap items-center gap-4 rounded-full bg-paper/92 px-4 py-3 shadow-[0_12px_36px_-20px_rgba(16,18,14,0.55)] backdrop-blur-xl hairline"
        : "mt-6 flex flex-wrap items-center gap-4"}>
        <button type="submit" disabled={pending}
          className="group inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-[13px] text-cream transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-palm-deep active:scale-[0.97] disabled:opacity-40">
          {pending ? "Guardando..." : label}
          <span className="grid h-8 w-8 place-items-center rounded-full bg-cream/12 transition-transform duration-500 group-hover:translate-x-1">
            <Icon name="check" className="h-3.5 w-3.5" />
          </span>
        </button>

        {state.ok && (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-palm-deep">
            <Icon name="check" className="h-3.5 w-3.5" />{state.message}
          </span>
        )}
        {state.error && <span className="text-[13px] text-[#8a3a24]">{state.error}</span>}
        {!state.ok && !state.error && !pending && (
          <span className="text-[12px] text-ink-45">Los cambios se publican al instante.</span>
        )}
      </div>
    </form>
  );
}
