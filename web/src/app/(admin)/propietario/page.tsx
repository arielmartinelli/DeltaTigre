import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import AuthForm from "@/components/AuthForm";
import { getOwnerSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Acceso del propietario",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OwnerLoginPage() {
  const s = await getOwnerSession();
  if (s) redirect("/panel");

  return (
    <div className="relative min-h-[100dvh] bg-ink text-cream">
      <div className="absolute inset-0 opacity-[0.16]">
        <Image src="/img/delta-dos/12.webp" alt="" fill sizes="100vw" className="object-cover" priority />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/90 to-ink" />

      <div className="relative mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-5 py-32">
        <Reveal>
          <div className="mb-9 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-cream">
              <Image src="/brand/logo.webp" alt="Delta Tigre" width={128} height={128} className="h-full w-full object-cover" />
            </span>
            <span className="tag mt-6 inline-flex bg-cream/10 text-cream/70">
              <span className="h-1 w-1 rounded-full bg-palm-soft" />Acceso restringido
            </span>
            <h1 className="mt-5 font-display text-[clamp(1.9rem,5vw,2.8rem)] leading-[1.05]">
              Panel del propietario
            </h1>
            <p className="mt-4 text-[14.5px] leading-relaxed text-cream/55">
              Gestión de reservas, precios, fotos y contenido del sitio.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="shell shell-dark">
            <div className="core core-dark p-7 sm:p-9 [&_input]:!bg-white/5 [&_input]:!text-cream [&_input]:!shadow-[inset_0_0_0_1px_rgba(251,250,243,0.14)] [&_span]:!text-cream/50">
              <AuthForm mode="owner" />
            </div>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <Link href="/" className="ul-slide inline-flex items-center gap-2 text-[13px] text-cream/45 hover:text-cream">
              <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" />Volver al sitio
            </Link>
            <p className="max-w-xs text-[11.5px] leading-relaxed text-cream/30">
              Si perdiste el acceso, el propietario puede restablecerlo con
              <code className="mx-1 rounded bg-cream/10 px-1.5 py-0.5">npm run owner</code>
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
