import type { Metadata } from "next";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import { Eyebrow } from "@/components/Bits";
import { CTA } from "@/components/Button";
import { getActivities } from "@/lib/data";

export const metadata: Metadata = {
  title: "Qué hacer en el Delta",
  description: "Navegar, pescar, remar, comer sobre el río y recorrer el casco histórico de Tigre desde el Arroyo Gambado.",
};

export default async function ExperienciasPage() {
  const activities = await getActivities();

  return (
    <div className="pb-24 pt-32 md:pt-40">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="max-w-3xl">
          <Eyebrow>Experiencias</Eyebrow>
          <h1 className="mt-6 font-display text-[clamp(2.4rem,6.5vw,4.6rem)] leading-[0.98]">
            Qué hacer<br /><span className="italic text-palm-deep">en el Delta</span>
          </h1>
          <p className="mt-7 max-w-xl text-[16px] leading-relaxed text-ink-70">
            El Delta no se recorre con prisa. Estas son las cosas que más disfrutan quienes se quedan con nosotros.
          </p>
        </Reveal>
      </div>

      <div className="mt-20 space-y-24 md:space-y-32">
        {activities.map((a, i) => {
          const flip = i % 2 === 1;
          return (
            <section key={a.id} id={a.id} className="mx-auto max-w-6xl scroll-mt-32 px-5 md:px-8">
              <div className={`grid items-center gap-9 md:grid-cols-12 md:gap-12 ${flip ? "md:[direction:rtl]" : ""}`}>
                <Reveal className={`md:col-span-7 ${flip ? "md:[direction:ltr]" : ""}`}>
                  <div className="group relative aspect-[4/3] overflow-hidden rounded-[2rem] hairline">
                    <Image src={a.image} alt={a.title} fill sizes="(max-width:768px) 100vw, 58vw"
                      className="object-cover transition-transform duration-[1300ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.06]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/25 to-transparent" />
                  </div>
                </Reveal>

                <Reveal delay={120} className={`md:col-span-5 ${flip ? "md:[direction:ltr]" : ""}`}>
                  <Eyebrow>{a.tag}</Eyebrow>
                  <h2 className="mt-5 font-display text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.04]">{a.title}</h2>
                  <p className="mt-5 text-[15.5px] leading-relaxed text-ink-70">{a.body}</p>
                  <p className="mt-5 border-l-2 border-palm pl-4 text-[14px] italic leading-relaxed text-ink-45">{a.summary}</p>
                </Reveal>
              </div>
            </section>
          );
        })}
      </div>

      <section className="mx-auto mt-28 max-w-6xl px-5 md:px-8">
        <Reveal className="flex flex-col items-center gap-6 rounded-[2.25rem] bg-ink px-7 py-16 text-center text-cream md:py-20">
          <Eyebrow dark>Reservas</Eyebrow>
          <h2 className="max-w-xl font-display text-[clamp(2rem,4.8vw,3.2rem)] leading-[1.03]">
            ¿Te tienta? Elegí tus fechas
          </h2>
          <CTA href="/cabanas" variant="wa" icon="cal">Ver disponibilidad</CTA>
        </Reveal>
      </section>
    </div>
  );
}
