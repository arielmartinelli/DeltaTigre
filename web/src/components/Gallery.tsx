"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import Icon from "./Icon";
import type { Img } from "@/lib/data";

export default function Gallery({ images, name }: { images: Img[]; name: string }) {
  const [idx, setIdx] = useState<number | null>(null);
  const close = useCallback(() => setIdx(null), []);
  const go = useCallback((d: number) => setIdx((i) => (i === null ? null : (i + d + images.length) % images.length)), [images.length]);

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [idx, close, go]);

  const [a, b, c, d, e] = images;

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2.5 overflow-hidden rounded-[1.75rem] md:h-[62vh] md:max-h-[560px]">
        {[a, b, c, d, e].filter(Boolean).map((im, i) => (
          <button key={im.id} onClick={() => setIdx(i)}
            className={`group relative overflow-hidden ${i === 0 ? "col-span-4 row-span-2 aspect-[4/3] md:col-span-2 md:aspect-auto" : "col-span-2 row-span-1 aspect-[4/3] md:col-span-1 md:aspect-auto"}`}>
            <Image src={im.url} alt={im.alt} fill priority={i === 0}
              sizes={i === 0 ? "(max-width:768px) 100vw, 50vw" : "(max-width:768px) 50vw, 25vw"}
              className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.06]" />
            <span className="absolute inset-0 bg-ink/0 transition-colors duration-600 group-hover:bg-ink/15" />
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-[12.5px] text-ink-45">{images.length} fotos de {name}</p>
        <button onClick={() => setIdx(0)}
          className="group inline-flex items-center gap-3 rounded-full bg-paper py-2 pl-5 pr-2 text-[13px] hairline transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink hover:text-cream active:scale-[0.97]">
          Ver todas las fotos
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ink/6 transition-transform duration-500 group-hover:translate-x-1 group-hover:bg-cream/15">
            <Icon name="arrow" className="h-3.5 w-3.5" />
          </span>
        </button>
      </div>

      {/* Lightbox */}
      <div className={`fixed inset-0 z-50 flex flex-col bg-ink/95 backdrop-blur-2xl transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${idx !== null ? "opacity-100" : "pointer-events-none opacity-0"}`} role="dialog" aria-modal="true">
        <div className="flex items-center justify-between px-5 py-5 text-cream md:px-8">
          <span className="text-[12.5px] tabular-nums text-cream/60">
            {(idx ?? 0) + 1} / {images.length}
          </span>
          <button onClick={close} aria-label="Cerrar"
            className="grid h-10 w-10 place-items-center rounded-full bg-cream/10 transition-all duration-400 hover:rotate-90 hover:bg-cream/20">
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex-1">
          {idx !== null && (
            <Image key={images[idx].id} src={images[idx].url} alt={images[idx].alt} fill sizes="100vw"
              className="object-contain px-3 pb-3" />
          )}
          <button onClick={() => go(-1)} aria-label="Anterior"
            className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cream/10 text-cream transition-all duration-400 hover:bg-cream/22 md:left-6">
            <Icon name="arrow" className="h-4 w-4 rotate-180" />
          </button>
          <button onClick={() => go(1)} aria-label="Siguiente"
            className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cream/10 text-cream transition-all duration-400 hover:bg-cream/22 md:right-6">
            <Icon name="arrow" className="h-4 w-4" />
          </button>
        </div>

        <p className="px-6 pb-3 text-center text-[13px] text-cream/60">{idx !== null ? images[idx].alt : ""}</p>

        <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-6 md:px-8">
          {images.map((im, i) => (
            <button key={im.id} onClick={() => setIdx(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]
                ${i === idx ? "opacity-100 ring-2 ring-palm-soft" : "opacity-45 hover:opacity-80"}`}>
              <Image src={im.url} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
