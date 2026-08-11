import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import AuthForm from "@/components/AuthForm";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Ingresar", robots: { index: false } };

export default async function LoginPage() {
  const s = await getSession();
  if (s) redirect(s.role === "owner" ? "/panel" : "/mi-cuenta");
  return (
    <AuthShell
      eyebrow="Tu cuenta"
      title={<>Bienvenido<br /><span className="script script-verde">de vuelta</span></>}
      subtitle="Ingresá para solicitar reservas y seguir el estado de tus solicitudes."
      image="/img/delta-dos/13.webp"
    >
      <AuthForm mode="login" />
      <p className="mt-6 border-t border-ink/8 pt-5 text-center text-[12.5px] leading-relaxed text-ink-45">
        ¿Sos el propietario? Ingresá con tu email y entrás directo al panel de reservas.
      </p>
    </AuthShell>
  );
}
