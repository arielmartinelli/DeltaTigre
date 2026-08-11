import Image from "next/image";
import Link from "next/link";
import Icon from "./Icon";
import { Stars } from "./Bits";
import { money } from "@/lib/utils";
import type { Property, Img } from "@/lib/data";

export default function PropertyCard({
  p, images, priority = false, large = false,
}: { p: Property; images: Img[]; priority?: boolean; large?: boolean }) {
  const cover = images[0];
  const peek = images.slice(1, 4);
  return (
    <Link href={`/cabanas/${p.slug}`} className="group block">
      <article className="shell transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-1.5">
        <div className="core overflow-hidden">
          <div className={`relative overflow-hidden rounded-[calc(var(--radius-core)-0.25rem)] ${large ? "aspect-[16/11]" : "aspect-[4/3]"}`}>
            {cover && (
              <Image
                src={cover.url} alt={cover.alt} fill priority={priority}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.06]"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/5 to-transparent opacity-80" />

            <div className="absolute left-4 top-4 flex gap-2">
              <span className="tag bg-paper/85 text-ink backdrop-blur-md">{p.kind}</span>
              {p.rating > 0 && (
                <span className="tag bg-paper/85 text-ink backdrop-blur-md"><Stars value={p.rating} /></span>
              )}
            </div>

            {/* Miniaturas que aparecen al hover */}
            <div className="pointer-events-none absolute bottom-4 right-4 hidden gap-2 sm:flex">
              {peek.map((im, i) => (
                <span key={im.id}
                  className="relative h-14 w-14 overflow-hidden rounded-xl opacity-0 shadow-lg ring-1 ring-paper/40 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-0 group-hover:opacity-100"
                  style={{ transform: "translateY(14px)", transitionDelay: `${i * 70}ms` }}>
                  <Image src={im.url} alt="" fill sizes="56px" className="object-cover" />
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5 px-6 pb-6 pt-6 sm:px-7">
            <div>
              <h3 className="display text-[clamp(1.8rem,3.4vw,2.35rem)] leading-[1.1]">{p.name}</h3>
              <p className="mt-2 max-w-md text-[14.5px] leading-relaxed text-ink-45">{p.tagline}</p>
            </div>

            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-70">
              <li className="inline-flex items-center gap-2"><Icon name="size" className="h-4 w-4 text-palm" />{p.sizeM2} m²</li>
              <li className="inline-flex items-center gap-2"><Icon name="bed" className="h-4 w-4 text-palm" />{p.bedrooms} dorm.</li>
              <li className="inline-flex items-center gap-2"><Icon name="bath" className="h-4 w-4 text-palm" />{p.bathrooms} baño{p.bathrooms > 1 ? "s" : ""}</li>
              <li className="inline-flex items-center gap-2"><Icon name="users" className="h-4 w-4 text-palm" />hasta {p.maxGuests}</li>
            </ul>

            <div className="flex items-end justify-between gap-4 border-t border-ink/8 pt-5">
              <p className="text-[13px] text-ink-45">
                <span className="display text-[25px] text-ink">{money(p.basePrice, p.currency)}</span>
                <span className="ml-1.5">/ noche</span>
              </p>
              <span className="inline-flex items-center gap-2 text-[13px] font-medium text-ink">
                Ver la casa
                <span className="grid h-8 w-8 place-items-center rounded-full bg-ink/6 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-ink group-hover:text-cream group-hover:translate-x-1">
                  <Icon name="arrow" className="h-3.5 w-3.5" />
                </span>
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
