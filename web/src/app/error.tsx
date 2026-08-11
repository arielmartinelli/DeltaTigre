"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="mx-auto flex min-h-[80dvh] max-w-2xl flex-col items-center justify-center gap-6 px-5 text-center">
      <span className="tag bg-palm-wash text-palm-deep">Algo salió mal</span>
      <h1 className="font-display text-[clamp(2rem,5.1vw,3.1rem)] leading-tight">
        No pudimos cargar esta página
      </h1>
      <p className="max-w-sm text-[15px] leading-relaxed text-ink-45">
        Puede ser un problema momentáneo de conexión. Probá de nuevo en unos segundos.
      </p>
      {error.digest && (
        <p className="text-[11.5px] tabular-nums text-ink-45/70">Referencia: {error.digest}</p>
      )}
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <button onClick={reset}
          className="rounded-full bg-ink px-6 py-3 text-[13px] text-cream transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-palm-deep active:scale-[0.97]">
          Reintentar
        </button>
        <Link href="/"
          className="rounded-full px-6 py-3 text-[13px] hairline transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink hover:text-cream">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
