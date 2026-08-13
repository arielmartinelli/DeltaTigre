"use client";
import { useActionState, useState } from "react";
import { updateOwnerAccountAction, type State } from "@/app/actions";
import { Field, inputCx } from "@/components/Bits";
import Icon from "@/components/Icon";

export default function CuentaForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState<State, FormData>(updateOwnerAccountAction, {});
  const [cambiarClave, setCambiarClave] = useState(false);

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre">
          <input name="name" defaultValue={name} required className={inputCx} />
        </Field>
        <Field label="Email" hint="Con este email entrás al panel">
          <input name="email" type="email" defaultValue={email} required autoComplete="username" className={inputCx} />
        </Field>
      </div>

      <div className="rounded-2xl bg-shell/60 p-4">
        <Field label="Contraseña actual" hint="Siempre se pide para confirmar los cambios">
          <input name="actual" type="password" required autoComplete="current-password"
            placeholder="••••••••" className={inputCx} />
        </Field>
      </div>

      <button type="button" onClick={() => setCambiarClave((v) => !v)}
        className="flex w-full items-center justify-between rounded-2xl px-1 py-1 text-[13.5px] text-ink-70 transition-colors hover:text-ink">
        <span className="inline-flex items-center gap-2">
          <Icon name="login" className="h-4 w-4 text-palm" />
          {cambiarClave ? "No cambiar la contraseña" : "También quiero cambiar la contraseña"}
        </span>
        <Icon name="arrow" className={`h-3.5 w-3.5 text-ink-45 transition-transform duration-400 ${cambiarClave ? "-rotate-90" : "rotate-90"}`} />
      </button>

      <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${cambiarClave ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="grid gap-4 rounded-2xl bg-palm-wash/40 p-4 sm:grid-cols-2">
            <Field label="Contraseña nueva" hint="Mínimo 8 caracteres">
              <input name="nueva" type="password" autoComplete="new-password" minLength={8}
                placeholder="••••••••" className={inputCx} />
            </Field>
            <Field label="Repetirla">
              <input name="repetir" type="password" autoComplete="new-password" minLength={8}
                placeholder="••••••••" className={inputCx} />
            </Field>
          </div>
        </div>
      </div>

      {state.error && (
        <p className="rounded-2xl bg-[#f6e6e0] px-4 py-3 text-[13px] text-[#8a3a24]">{state.error}</p>
      )}
      {state.ok && (
        <p className="inline-flex items-center gap-2 rounded-2xl bg-palm-wash px-4 py-3 text-[13px] text-palm-deep">
          <Icon name="check" className="h-4 w-4" />{state.message}
        </p>
      )}

      <button type="submit" disabled={pending}
        className="group inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-[13px] text-cream transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-palm-deep active:scale-[0.97] disabled:opacity-40">
        {pending ? "Guardando..." : "Guardar cambios"}
        <span className="grid h-8 w-8 place-items-center rounded-full bg-cream/12 transition-transform duration-500 group-hover:translate-x-1">
          <Icon name="check" className="h-3.5 w-3.5" />
        </span>
      </button>
    </form>
  );
}
