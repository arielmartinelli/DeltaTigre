import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import MapEmbed from "@/components/MapEmbed";
import BookingForm from "@/components/BookingForm";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { Eyebrow, Stars, Divider } from "@/components/Bits";
import { CTA } from "@/components/Button";
import {
  getPropertyBySlug, getImages, getAmenities, getRules, getNearby,
  getBusyRanges, groupAmenities, getActiveProperties, getActivities,
} from "@/lib/data";
import { getSession } from "@/lib/session";

export async function generateStaticParams() {
  try {
    const props = await getActiveProperties();
    return props.map((p) => ({ slug: p.slug }));
  } catch {
    return []; // sin base disponible en build: se renderiza on-demand
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPropertyBySlug(slug);
  if (!p) return { title: "No encontrado" };
  return {
    title: p.name,
    description: p.tagline,
    openGraph: { title: `${p.name} · Delta Tigre`, description: p.tagline },
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPropertyBySlug(slug);
  if (!p) notFound();

  const [images, amenities, rules, nearby, busy, session, activities, all] = await Promise.all([
    getImages(p.id), getAmenities(p.id), getRules(p.id), getNearby(),
    getBusyRanges(p.id), getSession(), getActivities(), getActiveProperties(),
  ]);
  const { featured, groups } = groupAmenities(amenities);
  const other = all.find((x) => x.id !== p.id);

  const jsonLd = {
    "@context": "https://schema.org", "@type": "LodgingBusiness",
    name: `${p.name} — Delta Tigre`, description: p.tagline,
    address: { "@type": "PostalAddress", streetAddress: p.address, addressLocality: "Tigre", addressRegion: "Buenos Aires", addressCountry: "AR" },
    geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng },
    aggregateRating: p.reviews ? { "@type": "AggregateRating", ratingValue: p.rating, bestRating: 10, reviewCount: p.reviews } : undefined,
    numberOfRooms: p.bedrooms, petsAllowed: false,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-6xl px-5 pt-32 md:px-8 md:pt-40">
        {/* Encabezado */}
        <Reveal className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Eyebrow>{p.kind} · {p.sizeM2} m²</Eyebrow>
              {p.reviews > 0 && (
                <span className="tag bg-ink/5 text-ink-70">
                  <Stars value={p.rating} /> <span className="normal-case tracking-normal text-ink-45">· {p.reviews} opiniones</span>
                </span>
              )}
            </div>
            <h1 className="mt-5 font-display text-[clamp(2.4rem,6vw,4.2rem)] leading-[0.98]">{p.name}</h1>
            <p className="mt-4 flex items-center gap-2 text-[14px] text-ink-45">
              <Icon name="pin" className="h-4 w-4 text-palm" />{p.address}
            </p>
          </div>
          <Link href="/cabanas" className="ul-slide shrink-0 text-[13px] text-ink-45 hover:text-ink">← Volver a las casas</Link>
        </Reveal>

        <Reveal delay={80}><Gallery images={images} name={p.name} /></Reveal>

        {/* Cuerpo */}
        <div className="mt-20 grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-20 lg:col-span-7">
            <Reveal>
              <h2 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] leading-tight">{p.tagline}</h2>
              <div className="mt-6 space-y-4 text-[15.5px] leading-relaxed text-ink-70">
                {p.description.split("\n\n").map((par, i) => <p key={i}>{par}</p>)}
              </div>

              <ul className="mt-9 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-ink/8 pt-8 sm:grid-cols-4">
                {[
                  ["size", `${p.sizeM2} m²`, "superficie"],
                  ["bed", `${p.bedrooms}`, `dormitorio${p.bedrooms > 1 ? "s" : ""}`],
                  ["bath", `${p.bathrooms}`, `baño${p.bathrooms > 1 ? "s" : ""}`],
                  ["users", `${p.maxGuests}`, "huéspedes"],
                ].map(([ic, n, l]) => (
                  <li key={l}>
                    <Icon name={ic} className="h-5 w-5 text-palm" />
                    <p className="mt-3 display text-[22px] leading-none">{n}</p>
                    <p className="mt-1 text-[12.5px] text-ink-45">{l}</p>
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* Destacados */}
            {featured.length > 0 && (
              <Reveal>
                <Eyebrow>Lo que más se disfruta</Eyebrow>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {featured.map((a, i) => (
                    <div key={a.id}
                      className="group flex items-center gap-3.5 rounded-2xl bg-paper px-4 py-3.5 hairline transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-28px_rgba(16,18,14,0.55)]"
                      style={{ transitionDelay: `${i * 30}ms` }}>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-palm-wash text-palm-deep transition-transform duration-500 group-hover:scale-105">
                        <Icon name={a.icon} className="h-4.5 w-4.5" />
                      </span>
                      <span className="text-[14.5px]">{a.label}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {/* Todos los servicios */}
            <Reveal>
              <Eyebrow>Servicios y equipamiento</Eyebrow>
              <h3 className="mt-5 font-display text-[clamp(1.6rem,3.4vw,2.2rem)]">Todo lo que vas a encontrar</h3>
              <div className="mt-8 grid gap-x-10 gap-y-9 sm:grid-cols-2">
                {groups.map((g) => (
                  <div key={g.category}>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-ink-45">{g.category}</p>
                    <ul className="mt-4 space-y-2.5">
                      {g.items.map((a) => (
                        <li key={a.id} className="group flex items-center gap-3 text-[14.5px] text-ink-70">
                          <Icon name={a.icon} className="h-4 w-4 shrink-0 text-palm transition-transform duration-400 group-hover:scale-110" />
                          {a.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Normas */}
            <Reveal>
              <Eyebrow>Normas de la casa</Eyebrow>
              <div className="mt-6 shell">
                <div className="core divide-y divide-ink/8">
                  {rules.map((r) => (
                    <div key={r.id} className="flex gap-4 px-6 py-5">
                      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-shell text-ink-70">
                        <Icon name={r.icon} className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[14.5px] font-medium">{r.label}</p>
                        <p className="mt-1 text-[14px] leading-relaxed text-ink-45">{r.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Ubicacion */}
            <Reveal>
              <Eyebrow>Ubicación</Eyebrow>
              <h3 className="mt-5 font-display text-[clamp(1.6rem,3.4vw,2.2rem)]">Dónde queda</h3>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-70">
                {p.address}. Se llega en lancha colectiva desde la Estación Fluvial de Tigre, a 2,2 km del Parque de la Costa.
              </p>
              <div className="mt-7"><MapEmbed lat={p.lat} lng={p.lng} label={p.address} /></div>

              <div className="mt-9 grid gap-x-10 gap-y-7 sm:grid-cols-2">
                {["Atracciones", "Gastronomia", "Transporte", "Aeropuertos"].map((cat) => (
                  <div key={cat}>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-ink-45">{cat}</p>
                    <ul className="mt-3.5 space-y-2">
                      {nearby.filter((n) => n.category === cat).map((n) => (
                        <li key={n.id} className="flex items-baseline justify-between gap-4 border-b border-dashed border-ink/10 pb-1.5 text-[14px]">
                          <span className="text-ink-70">{n.name}</span>
                          <span className="shrink-0 tabular-nums text-[12.5px] text-ink-45">{n.distance}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Columna de reserva */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Reveal delay={60}>
                <BookingForm property={p} busy={busy} isLogged={!!session} />
              </Reveal>
            </div>
          </div>
        </div>

        {/* Que hacer cerca */}
        <section className="mt-28">
          <Reveal className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>En los alrededores</Eyebrow>
              <h2 className="mt-5 font-display text-[clamp(1.9rem,4.4vw,3rem)]">Cosas para hacer cerca</h2>
            </div>
            <CTA href="/experiencias" variant="outline" icon="beach">Ver todas</CTA>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activities.slice(0, 3).map((a, i) => (
              <Reveal key={a.id} delay={i * 100}>
                <Link href={`/experiencias#${a.id}`} className="group block overflow-hidden rounded-[1.6rem] hairline bg-paper">
                  <span className="relative block aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.image} alt={a.title} loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.07]" />
                  </span>
                  <span className="block px-5 py-5">
                    <span className="tag bg-palm-wash text-palm-deep">{a.tag}</span>
                    <span className="mt-3 block font-display text-[20px]">{a.title}</span>
                    <span className="mt-1.5 block text-[13.5px] leading-relaxed text-ink-45">{a.summary}</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {other && (
          <>
            <div className="mt-24"><Divider /></div>
            <Reveal className="mt-16 mb-6 flex flex-col gap-5 rounded-[2rem] bg-ink px-7 py-10 text-cream sm:flex-row sm:items-center sm:justify-between md:px-10">
              <div>
                <Eyebrow dark>La otra casa</Eyebrow>
                <h3 className="mt-4 font-display text-[clamp(1.7rem,3.6vw,2.4rem)] leading-tight">{other.name}</h3>
                <p className="mt-2 max-w-md text-[14.5px] text-cream/60">{other.tagline}</p>
              </div>
              <CTA href={`/cabanas/${other.slug}`} variant="outline"
                className="shrink-0 !text-cream !shadow-[inset_0_0_0_1px_rgba(251,250,243,0.3)] hover:!bg-cream hover:!text-ink">
                Ver {other.name}
              </CTA>
            </Reveal>
          </>
        )}
      </div>
    </>
  );
}

export const dynamic = "force-dynamic";
export const maxDuration = 25;
