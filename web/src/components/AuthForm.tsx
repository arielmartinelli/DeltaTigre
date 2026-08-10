"use client";
import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction, type State } from "@/app/actions";
import { ActionButton } from "./Button";
import { Field, inputCx } from "./Bits";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [state, action, pending] = useActionState<State, FormData>(
    mode === "login" ? loginAction : registerAction, {}
  );

  return (
    <form action={action} className="space-y-4">
      {mode === "register" && (
        <Field label="Nombre y apellido">
          <input name="name" required autoComplete="name" placeholder="Ana Gómez" className={inputCx} />
        </Field>
      )}
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" placeholder="vos@email.com" className={inputCx} />
      </Field>
      {mode === "register" && (
        <Field label="WhatsApp" hint="Te avisamos por acá cuando el propietario responda">
          <input name="phone" type="tel" autoComplete="tel" placeholder="+54 9 11 ..." className={inputCx} />
        </Field>
      )}
      <Field label="Contraseña" hint={mode === "register" ? "Mínimo 8 caracteres" : undefined}>
        <input name="password" type="password" required minLength={mode === "register" ? 8 : 1}
          autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="••••••••" className={inputCx} />
      </Field>

      {state.error && (
        <p className="rounded-2xl bg-[#f6e6e0] px-4 py-3 text-[13px] text-[#8a3a24]">{state.error}</p>
      )}

      <ActionButton type="submit" disabled={pending} className="w-full justify-between">
        {pending ? "Un momento..." : mode === "login" ? "Ingresar" : "Crear mi cuenta"}
      </ActionButton>

      <p className="pt-2 text-center text-[13px] text-ink-45">
        {mode === "login" ? (
          <>¿No tenés cuenta? <Link href="/crear-cuenta" className="ul-slide text-ink">Creá una</Link></>
        ) : (
          <>¿Ya tenés cuenta? <Link href="/ingresar" className="ul-slide text-ink">Ingresá</Link></>
        )}
      </p>
    </form>
  );
}
