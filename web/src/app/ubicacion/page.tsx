import type { Metadata } from "next";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import MapEmbed from "@/components/MapEmbed";
import Icon from "@/components/Icon";
import { Eyebrow, Divider } from "@/components/Bits";
import { CTA } from "@/components/Button";
import { getActiveProperties, getNearby } from "@/lib/data";

export const metadata: Metadata = {
  title: "Ubicación y cómo llegar",
  description: "Arroyo Gambado, primera sección del Delta de Tigre. Cómo llegar en lancha, tren o auto desde Buenos Aires.",
};

const steps = [
  { icon: "train", t: "Llegá a Tigre", d: "Tren de la línea Mitre (ramal Tigre) desde Retiro, o el Tren de la Costa desde Maipú. En auto, por Panamericana ramal Tigre — hay estacionamientos pagos junto a la estación fluvial." },
  { icon: "boat", t: "Tomá la lancha colectiva", d: "En la Estación Fluvial de Tigre salen las lanchas de línea. Pedí el ramal del Arroyo Gambado y avisá el número de muelle: 486 para Delta Uno, 147 para Delta Dos. El viaje es de unos 25 minutos." },
  { icon: "pin", t: "Bajá en el muelle", d: "El lanchero para en la puerta. Avisanos tu horario de llegada con antelación así te esperamos en el muelle." },
];

export default async function UbicacionPage() {
  const [props, nearby] = await Promise.all([getActiveProperties(), getNearby()]);

  return (
    <div className="pb-8 pt-32 md:pt-40">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="max-w-3xl">
          <Eyebrow>Cómo llegar</Eyebrow>
          <h1 className="mt-6 font-display text-[clamp(2.4rem,6.5vw,4.6rem)] leading-[0.98]">
            Arroyo Gambado,<br /><span className="italic text-palm-deep">primera sección</span>
          </h1>
          <p className="mt-7 max-w-xl text-[16px] leading-relaxed text-ink-70">
            A 40 minutos de Buenos Aires y a 25 minutos de lancha de la Estación Fluvial de Tigre. Sin autos, sin ruido:
            se llega por agua y se vive por agua.
          </p>
        </Reveal>

        <Reveal delay={100} className="mt-14">
          <MapEmbed lat={-34.4141} lng={-58.5807} label="Arroyo Gambado, Tigre, Buenos Aires" zoomBox={0.02} />
        </Reveal>

        {/* Pasos */}
        <section className="mt-24">
          <Reveal><Eyebrow>Paso a paso</Eyebrow>
            <h2 className="mt-5 font-display text-[clamp(1.9rem,4.4vw,3rem)]">Tres tramos y llegaste</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.t} delay={i * 110} className="shell h-full">
                <div className="core flex h-full flex-col gap-4 p-7">
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-palm-wash text-palm-deep">
                      <Icon name={s.icon} className="h-5 w-5" />
                    </span>
                    <span className="display text-[42px] leading-none text-ink/10">{i + 1}</span>
                  </div>
                  <h3 className="font-display text-[22px]">{s.t}</h3>
                  <p className="text-[14.5px] leading-relaxed text-ink-45">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Las dos direcciones */}
        <section className="mt-24 grid gap-6 md:grid-cols-2">
          {props.map((p, i) => (
            <Reveal key={p.id} delay={i * 110} className="shell">
              <div className="core overflow-hidden">
                <div className="relative aspect-[16/9] overflow-hidden rounded-[calc(var(--radius-core)-0.25rem)]">
                  <Image src={i === 0 ? "/img/delta-uno/11.webp" : "/img/delta-dos/07.webp"} alt={`Muelle de ${p.name}`} fill
                    sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-[24px]">{p.name}</h3>
                  <p className="mt-2 flex items-center gap-2 text-[14px] text-ink-45">
                    <Icon name="pin" className="h-4 w-4 text-palm" />{p.address}
                  </p>
                  <CTA href={`/cabanas/${p.slug}`} variant="outline" className="mt-6">Ver la casa</CTA>
                </div>
              </div>
            </Reveal>
          ))}
        </section>

        <div className="mt-24"><Divider /></div>

        {/* Alrededores */}
        <section className="mt-16">
          <Reveal><Eyebrow>Alrededores</Eyebrow>
            <h2 className="mt-5 font-display text-[clamp(1.9rem,4.4vw,3rem)]">Qué hay cerca</h2>
          </Reveal>
          <div className="mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {["Atracciones", "Gastronomia", "Transporte", "Aeropuertos"].map((cat, i) => (
              <Reveal key={cat} delay={i * 80}>
                <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-ink-45">
                  <Icon name={cat === "Gastronomia" ? "restaurant" : cat === "Transporte" ? "train" : cat === "Aeropuertos" ? "plane" : "museum"} className="h-4 w-4 text-palm" />
                  {cat}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {nearby.filter((n) => n.category === cat).map((n) => (
                    <li key={n.id} className="flex items-baseline justify-between gap-3 border-b border-dashed border-ink/10 pb-2 text-[14px]">
                      <span className="text-ink-70">{n.name}</span>
                      <span className="shrink-0 tabular-nums text-[12.5px] text-ink-45">{n.distance}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
