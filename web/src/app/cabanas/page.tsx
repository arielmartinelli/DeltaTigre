import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import PropertyCard from "@/components/PropertyCard";
import { Eyebrow } from "@/components/Bits";
import { getActiveProperties, getCovers } from "@/lib/data";

export const metadata: Metadata = {
  title: "Las cabañas",
  description: "Delta Uno y Delta Dos: dos casas de madera sobre el Arroyo Gambado, con deck, parrilla y muelle propio.",
};

export default async function CabanasPage() {
  const props = await getActiveProperties();
  const covers = await getCovers(props.map((p) => p.id));

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-36 md:px-8 md:pt-44">
      <Reveal className="max-w-3xl">
        <Eyebrow>Alojamientos</Eyebrow>
        <h1 className="mt-6 font-display text-[clamp(2.4rem,6.5vw,4.6rem)] leading-[0.98]">
          Elegí tu casa<br /><span className="italic text-palm-deep">sobre el arroyo</span>
        </h1>
        <p className="mt-7 max-w-xl text-[16px] leading-relaxed text-ink-70">
          Las dos están sobre el mismo brazo del Arroyo Gambado, a metros una de la otra. Se alquilan por separado
          o juntas para grupos grandes.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-7 md:mt-20 md:grid-cols-2 md:gap-8">
        {props.map((p, i) => (
          <Reveal key={p.id} delay={i * 130}>
            <PropertyCard p={p} images={covers[p.id] ?? []} priority={i === 0} large />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
export const maxDuration = 20;
