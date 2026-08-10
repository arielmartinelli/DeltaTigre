"use client";
import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { uploadImagesAction, deleteImageAction, moveImageAction, updateImageAltAction, type State } from "@/app/actions";
import Icon from "@/components/Icon";
import { inputCx } from "@/components/Bits";
import type { Img } from "@/lib/data";

export default function ImageManager({ propertyId, images }: { propertyId: string; images: Img[] }) {
  const [state, action, pending] = useActionState<State, FormData>(uploadImagesAction, {});
  const [count, setCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <form action={action} className="shell">
        <div className="core flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <input type="hidden" name="propertyId" value={propertyId} />
          <label className="group flex flex-1 cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-ink/20 px-5 py-5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-palm hover:bg-palm-wash/40">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-palm-wash text-palm-deep transition-transform duration-500 group-hover:scale-105">
              <Icon name="plus" className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-[14.5px] font-medium">
                {count ? `${count} archivo(s) elegido(s)` : "Subir fotos"}
              </span>
              <span className="block text-[12.5px] text-ink-45">JPG, PNG, WEBP o AVIF · hasta 8 MB cada una</span>
            </span>
            <input ref={inputRef} type="file" name="files" accept="image/*" multiple className="sr-only"
              onChange={(e) => setCount(e.target.files?.length ?? 0)} />
          </label>
          <button type="submit" disabled={pending || !count}
            className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-[13px] text-cream transition-all duration-500 hover:bg-palm-deep active:scale-[0.97] disabled:opacity-30">
            {pending ? "Subiendo..." : "Subir"}
            <span className="grid h-8 w-8 place-items-center rounded-full bg-cream/12 transition-transform duration-500 group-hover:translate-x-1">
              <Icon name="arrow" className="h-3.5 w-3.5" />
            </span>
          </button>
        </div>
        {(state.error || state.ok) && (
          <p className={`px-5 pt-3 text-[13px] ${state.error ? "text-[#8a3a24]" : "text-palm-deep"}`}>{state.error ?? state.message}</p>
        )}
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((im, i) => (
          <div key={im.id} className="shell group">
            <div className="core overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[calc(var(--radius-core)-0.25rem)]">
                <Image src={im.url} alt={im.alt} fill sizes="33vw" className="object-cover" />
                {i === 0 && <span className="tag absolute left-3 top-3 bg-paper/90 text-ink">Portada</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 p-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <form action={moveImageAction}>
                    <input type="hidden" name="id" value={im.id} /><input type="hidden" name="dir" value={-1} />
                    <button aria-label="Subir" className="grid h-9 w-9 place-items-center rounded-full bg-paper/90 backdrop-blur transition-transform hover:scale-110">
                      <Icon name="arrow" className="h-3.5 w-3.5 -rotate-90" />
                    </button>
                  </form>
                  <form action={moveImageAction}>
                    <input type="hidden" name="id" value={im.id} /><input type="hidden" name="dir" value={1} />
                    <button aria-label="Bajar" className="grid h-9 w-9 place-items-center rounded-full bg-paper/90 backdrop-blur transition-transform hover:scale-110">
                      <Icon name="arrow" className="h-3.5 w-3.5 rotate-90" />
                    </button>
                  </form>
                  <form action={deleteImageAction}>
                    <input type="hidden" name="id" value={im.id} />
                    <button aria-label="Eliminar" className="grid h-9 w-9 place-items-center rounded-full bg-paper/90 text-[#8a3a24] backdrop-blur transition-transform hover:scale-110">
                      <Icon name="trash" className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              </div>
              <form action={updateImageAltAction} className="flex gap-2 p-3">
                <input type="hidden" name="id" value={im.id} />
                <input name="alt" defaultValue={im.alt} placeholder="Descripción de la foto"
                  className={`${inputCx} !py-2 !text-[13px]`} />
                <button className="shrink-0 rounded-xl px-3 text-[12px] text-ink-45 hairline transition-colors hover:bg-ink hover:text-cream">OK</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
