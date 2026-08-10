"use client";
import { useActionState } from "react";
import type { State } from "@/app/actions";
import Icon from "@/components/Icon";

export default function SaveForm({
  action, children, label = "Guardar cambios", className = "",
}: {
  action: (prev: State, form: FormData) => Promise<State>;
  children: React.ReactNode; label?: string; className?: string;
}) {
  const [state, formAction, pending] = useActionState<State, FormData>(action, {});
  return (
    <form action={formAction} className={className}>
      {children}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending}
          className="group inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-[13px] text-cream transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-palm-deep active:scale-[0.97] disabled:opacity-40">
          {pending ? "Guardando..." : label}
          <span className="grid h-8 w-8 place-items-center rounded-full bg-cream/12 transition-transform duration-500 group-hover:translate-x-1">
            <Icon name="check" className="h-3.5 w-3.5" />
          </span>
        </button>
        {state.ok && <span className="text-[13px] text-palm-deep">{state.message}</span>}
        {state.error && <span className="text-[13px] text-[#8a3a24]">{state.error}</span>}
      </div>
    </form>
  );
}
