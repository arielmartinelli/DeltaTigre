"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { CTA } from "./Button";
import { Eyebrow } from "./Bits";

export default function Hero({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  const [on, setOn] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 90);
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 700);
        if (imgRef.current) imgRef.current.style.transform = `translate3d(0, ${y * 0.22}px, 0) scale(${1 + y * 0.00012})`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  const lines = title.split("\n");

  return (
    <section className="relative min-h-[100dvh] overflow-hidden pt-32">
      <div ref={imgRef} className="absolute inset-0 -z-10 will-change-transform">
        <Image src="/img/delta-uno/13.webp" alt="La cabaña vista desde el arroyo" fill priority sizes="100vw"
          className={`object-cover transition-all duration-[1800ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${on ? "scale-100 blur-0" : "scale-110 blur-lg"}`} />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/25 to-cream" />
        <div className="absolute inset-0 bg-gradient-to-tr from-palm-deep/25 via-transparent to-transparent" />
      </div>

      <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-6xl flex-col justify-center px-5 pb-28 md:px-8 md:pb-32">
        <div className={on ? "in" : ""}>
          <div className="overflow-hidden">
            <div className="transition-all duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{ transform: on ? "translateY(0)" : "translateY(120%)", opacity: on ? 1 : 0 }}>
              <Eyebrow dark>{eyebrow}</Eyebrow>
            </div>
          </div>

          <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.9rem,9vw,6.9rem)] leading-[0.95] text-cream">
            {lines.map((l, i) => (
              <span key={i} className="line-mask">
                <span style={{ transitionDelay: `${140 + i * 120}ms` }}>{l}</span>
              </span>
            ))}
          </h1>

          <p className="mt-8 max-w-xl text-[16px] leading-relaxed text-cream/78 transition-all duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{ transitionDelay: "480ms", transform: on ? "translateY(0)" : "translateY(28px)", opacity: on ? 1 : 0 }}>
            {subtitle}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3 transition-all duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{ transitionDelay: "600ms", transform: on ? "translateY(0)" : "translateY(28px)", opacity: on ? 1 : 0 }}>
            <CTA href="/cabanas" variant="solid">Ver las dos casas</CTA>
            <CTA href="/experiencias" variant="outline" icon="beach" className="!text-cream !shadow-[inset_0_0_0_1px_rgba(251,250,243,0.35)] hover:!bg-cream hover:!text-ink">
              Que hacer en el Delta
            </CTA>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-cream/50 md:flex">
        <span className="text-[10px] uppercase tracking-[0.25em]">Deslizá</span>
        <span className="h-9 w-px overflow-hidden bg-cream/25">
          <span className="block h-3 w-px animate-[floaty_2.4s_ease-in-out_infinite] bg-cream" />
        </span>
      </div>
    </section>
  );
}
