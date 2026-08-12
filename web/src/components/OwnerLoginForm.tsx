"use client";
import { useActionState } from "react";
import { loginOwnerAction, type State } from "@/app/actions";
import Icon from "./Icon";

const campo =
  "w-full rounded-2xl bg-white/5 px-4 py-3 text-[15px] text-cream shadow-[inset_0_0_0_1px_rgba(251,250,243,0.14)] " +
  "outline-none transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-cream/30 " +
  "focus:shadow-[inset_0_0_0_1px_rgba(169,198,143,0.5),0_0_0_3px_rgba(92,140,60,0.18)]";

export default function OwnerLoginForm() {
  const [state, action, pending] = useActionState<State, FormData>(loginOwnerAction, {});

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-cream/45">Email</span>
        <input name="email" type="email" required autoComplete="username"
          placeholder="propietario@deltatigre.com.ar" className={campo} />
      </label>

      <label className="block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-cream/45">Contraseña</span>
        <input name="password" type="password" required autoComplete="current-password"
          placeholder="••••••••" className={campo} />
      </label>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white/[0.04] px-4 py-3">
        <input type="checkbox" name="recordar" defaultChecked
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-palm)]" />
        <span>
          <span className="block text-[13.5px] text-cream/85">Mantener la sesión abierta</span>
          <span className="block text-[11.5px] leading-relaxed text-cream/40">
            No te vamos a pedir la contraseña de nuevo hasta que cierres sesión.
          </span>
        </span>
      </label>

      {state.error && (
        <p className="rounded-2xl bg-[#5c2318]/60 px-4 py-3 text-[13px] text-[#f0c9bd]">{state.error}</p>
      )}

      <button type="submit" disabled={pending}
        className="group flex w-full items-center justify-between rounded-full bg-cream py-2 pl-6 pr-2 text-[13px] font-medium text-ink transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-palm-soft active:scale-[0.98] disabled:opacity-40">
        {pending ? "Entrando..." : "Entrar al panel"}
        <span className="grid h-8 w-8 place-items-center rounded-full bg-ink/8 transition-transform duration-500 group-hover:translate-x-1">
          <Icon name="arrow" className="h-3.5 w-3.5" />
        </span>
      </button>
    </form>
  );
}
