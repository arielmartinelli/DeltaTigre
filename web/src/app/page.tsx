import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/Hero";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import PropertyCard from "@/components/PropertyCard";
import { CTA } from "@/components/Button";
import { Eyebrow, Divider } from "@/components/Bits";
import { getActiveProperties, getCovers, getSettings, getActivities, getNearby } from "@/lib/data";

export default async function Home() {
  const [props, settings, activities, nearby] = await Promise.all([
    getActiveProperties(), getSettings(), getActivities(), getNearby(),
  ]);
  const covers = await getCovers(props.map((p) => p.id));

  return (
    <>
      <Hero
        eyebrow={settings.hero_eyebrow ?? "Delta de Tigre"}
        title={settings.hero_title ?? "Dos casas de madera\nsobre el Arroyo Gambado"}
        subtitle={settings.hero_subtitle ?? ""}
      />

      {/* ---------- Cifras ---------- */}
      <section className="mx-auto -mt-8 max-w-6xl px-5 md:px-8">
        <Reveal className="shell">
          <div className="core grid grid-cols-2 divide-x divide-y divide-ink/8 sm:grid-cols-4 sm:divide-y-0">
            {[
              ["40 min", "de Buenos Aires"],
              ["2", "casas independientes"],
              ["9,7", "puntaje en Booking"],
              ["100 m", "a restaurantes y bar"],
            ].map(([n, l]) => (
              <div key={l} className="px-6 py-8 text-center">
                <p className="display text-[clamp(1.8rem,4vw,2.6rem)] leading-none">{n}</p>
                <p className="mt-2 text-[12.5px] text-ink-45">{l}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ---------- El lugar: split editorial + bento ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-28 md:px-8 md:py-40">
        <div className="grid gap-14 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <Reveal>
              <Eyebrow>{settings.about_title ?? "El lugar"}</Eyebrow>
              <h2 className="mt-6 font-display text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.02]">
                Se llega en lancha.<br />
                <span className="italic text-palm-deep">Se vuelve distinto.</span>
              </h2>
              <p className="mt-7 max-w-md text-[16px] leading-relaxed text-ink-70">{settings.about_body}</p>
              <div className="mt-9 space-y-4">
                {[
                  ["boat", "Lancha colectiva desde la Estacion Fluvial de Tigre"],
                  ["river", "Muelle propio y bajada al arroyo"],
                  ["bbq", "Parrilla, jardin con arboles anosos y fogon"],
                ].map(([i, t]) => (
                  <div key={t} className="flex items-start gap-3.5">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-palm-wash text-palm-deep">
                      <Icon name={i} className="h-4 w-4" />
                    </span>
                    <p className="pt-1.5 text-[14.5px] text-ink-70">{t}</p>
                  </div>
                ))}
              </div>
              <CTA href="/ubicacion" variant="outline" icon="pin" className="mt-10">Como llegar</CTA>
            </Reveal>
          </div>

          {/* Bento asimetrico */}
          <div className="grid grid-cols-2 gap-3 md:col-span-7 md:grid-cols-6 md:grid-rows-6 md:gap-4">
            {[
              { src: "/img/delta-uno/04.webp", alt: "Frente de la cabaña con deck de madera", cx: "col-span-2 md:col-span-4 md:row-span-4", d: 0 },
              { src: "/img/delta-dos/13.webp", alt: "Galería con hamacas paraguayas", cx: "md:col-span-2 md:row-span-3", d: 90 },
              { src: "/img/delta-uno/11.webp", alt: "Muelle de madera sobre el arroyo", cx: "md:col-span-2 md:row-span-3", d: 160 },
              { src: "/img/delta-dos/08.webp", alt: "Living comedor amplio", cx: "col-span-2 md:col-span-3 md:row-span-2", d: 220 },
              { src: "/img/delta-uno/10.webp", alt: "Restaurante junto al río", cx: "col-span-2 md:col-span-3 md:row-span-2", d: 280 },
            ].map((im) => (
              <Reveal key={im.src} delay={im.d} className={`${im.cx} group relative overflow-hidden rounded-[1.4rem]`}>
                <div className="relative h-full min-h-[150px] w-full overflow-hidden rounded-[1.4rem] hairline">
                  <Image src={im.src} alt={im.alt} fill sizes="(max-width:768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.07]" />
                  <div className="absolute inset-0 bg-ink/0 transition-colors duration-700 group-hover:bg-ink/12" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ---------- Las casas ---------- */}
      <section id="casas" className="mx-auto max-w-6xl px-5 py-28 md:px-8 md:py-36">
        <Reveal className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Alojamientos</Eyebrow>
            <h2 className="mt-5 max-w-lg font-display text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.02]">
              Dos casas, un mismo arroyo
            </h2>
          </div>
          <p className="max-w-xs text-[14.5px] leading-relaxed text-ink-45">
            Se alquilan por separado o juntas. Ideal para parejas, familias y grupos de hasta 18 personas.
          </p>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {props.map((p, i) => (
            <Reveal key={p.id} delay={i * 120}>
              <PropertyCard p={p} images={covers[p.id] ?? []} priority={i === 0} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Que hacer: carrusel horizontal ---------- */}
      <section className="bg-ink py-28 text-cream md:py-36">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow dark>Experiencias</Eyebrow>
              <h2 className="mt-5 max-w-lg font-display text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.02]">
                Que hacer <span className="italic text-palm-soft">alrededor</span>
              </h2>
            </div>
            <CTA href="/experiencias" variant="outline" className="!text-cream !shadow-[inset_0_0_0_1px_rgba(251,250,243,0.28)] hover:!bg-cream hover:!text-ink">
              Ver todo
            </CTA>
          </Reveal>
        </div>

        <div className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 md:px-[max(2rem,calc(50vw-36rem))]">
          {activities.map((a, i) => (
            <Link key={a.id} href={`/experiencias#${a.id}`}
              className="group relative aspect-[3/4] w-[76vw] shrink-0 snap-start overflow-hidden rounded-[1.75rem] sm:w-[330px]">
              <Image src={a.image} alt={a.title} fill sizes="(max-width:640px) 76vw, 330px"
                className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.08]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="tag bg-cream/12 text-cream/75">{a.tag}</span>
                <h3 className="mt-3 font-display text-[26px] leading-tight">{a.title}</h3>
                <p className="mt-2 max-h-0 overflow-hidden text-[13.5px] leading-relaxed text-cream/70 opacity-0 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:max-h-24 group-hover:opacity-100">
                  {a.summary}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Alrededores ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-28 md:px-8 md:py-36">
        <div className="grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <Eyebrow>Alrededores</Eyebrow>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.6vw,3.2rem)] leading-[1.03]">
              Todo cerca,<br /><span className="italic text-palm-deep">nada encima</span>
            </h2>
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-ink-70">
              A 2,2 km del Parque de la Costa y del casco historico de Tigre, con restaurantes a cien metros del muelle.
            </p>
            <CTA href="/ubicacion" variant="outline" icon="pin" className="mt-8">Ver mapa</CTA>
          </Reveal>

          <Reveal delay={120} className="md:col-span-8">
            <div className="shell">
              <div className="core grid gap-x-10 gap-y-8 p-7 sm:grid-cols-2 md:p-9">
                {["Atracciones", "Gastronomia", "Transporte", "Aeropuertos"].map((cat) => (
                  <div key={cat}>
                    <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-ink-45">
                      <Icon name={cat === "Gastronomia" ? "restaurant" : cat === "Transporte" ? "train" : cat === "Aeropuertos" ? "plane" : "museum"} className="h-4 w-4 text-palm" />
                      {cat}
                    </p>
                    <ul className="mt-4 space-y-2.5">
                      {nearby.filter((n) => n.category === cat).map((n) => (
                        <li key={n.id} className="flex items-baseline justify-between gap-4 border-b border-dashed border-ink/10 pb-2 text-[14px]">
                          <span className="text-ink-70">{n.name}</span>
                          <span className="shrink-0 tabular-nums text-[12.5px] text-ink-45">{n.distance}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- CTA final ---------- */}
      <section className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="relative overflow-hidden rounded-[2.25rem]">
          <div className="relative isolate overflow-hidden rounded-[2.25rem]">
            <Image src="/img/delta-dos/14.webp" alt="Galería de la casa al atardecer" fill sizes="100vw" className="-z-10 object-cover" />
            <div className="absolute inset-0 -z-10 bg-ink/62" />
            <div className="flex flex-col items-center gap-7 px-6 py-24 text-center md:py-32">
              <Eyebrow dark>Reservas</Eyebrow>
              <h2 className="max-w-2xl font-display text-[clamp(2.2rem,5.5vw,3.8rem)] leading-[1.02] text-cream">
                Contanos que fin de semana tenes en mente
              </h2>
              <p className="max-w-md text-[15.5px] leading-relaxed text-cream/70">
                Creas tu cuenta, elegis las fechas y enviamos la solicitud al propietario por WhatsApp. Te respondemos ahi mismo y en tu perfil.
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                <CTA href="/cabanas" variant="wa" icon="cal">Consultar disponibilidad</CTA>
                <CTA href="/crear-cuenta" variant="outline" icon="users"
                  className="!text-cream !shadow-[inset_0_0_0_1px_rgba(251,250,243,0.3)] hover:!bg-cream hover:!text-ink">
                  Crear cuenta
                </CTA>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

export const dynamic = "force-dynamic";
export const maxDuration = 20;
