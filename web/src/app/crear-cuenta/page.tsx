import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import AuthForm from "@/components/AuthForm";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Crear cuenta", robots: { index: false } };

export default async function RegisterPage() {
  const s = await getSession();
  if (s) redirect(s.role === "owner" ? "/panel" : "/mi-cuenta");
  return (
    <AuthShell
      eyebrow="Nueva cuenta"
      title={<>Creá tu cuenta<br /><span className="italic text-palm-deep">y reservá</span></>}
      subtitle="Con una cuenta podés pedir fechas, ver el estado de tus solicitudes y recibir la respuesta del propietario acá y por WhatsApp."
      image="/img/delta-uno/04.webp"
    >
      <AuthForm mode="register" />
    </AuthShell>
  );
}
