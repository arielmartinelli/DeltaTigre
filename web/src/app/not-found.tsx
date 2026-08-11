import Link from "next/link";
import { CTA } from "@/components/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[80dvh] max-w-2xl flex-col items-center justify-center gap-6 px-5 text-center">
      <span className="display text-[clamp(4rem,16vw,9rem)] leading-none text-ink/12">404</span>
      <h1 className="font-display text-[clamp(2rem,5.1vw,3.1rem)]">Esa página se fue río abajo</h1>
      <p className="max-w-sm text-[15px] leading-relaxed text-ink-45">
        No encontramos lo que buscabas. Volvé al inicio o mirá las dos casas.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <CTA href="/">Ir al inicio</CTA>
        <CTA href="/cabanas" variant="outline">Ver las cabañas</CTA>
      </div>
    </div>
  );
}
