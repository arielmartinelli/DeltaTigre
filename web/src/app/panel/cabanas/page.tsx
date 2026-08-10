import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { getProperties, getCovers } from "@/lib/data";
import { money } from "@/lib/utils";

export default async function PanelProperties() {
  const props = await getProperties();
  const covers = await getCovers(props.map((p) => p.id));

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {props.map((p, i) => (
        <Reveal key={p.id} delay={i * 90} className="shell">
          <Link href={`/panel/cabanas/${p.id}`} className="core group block overflow-hidden">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[calc(var(--radius-core)-0.25rem)]">
              {covers[p.id]?.[0] && (
                <Image src={covers[p.id][0].url} alt="" fill sizes="50vw"
                  className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105" />
              )}
              <span className={`tag absolute left-4 top-4 backdrop-blur-md ${p.active ? "bg-palm-wash/90 text-palm-deep" : "bg-paper/90 text-ink-45"}`}>
                {p.active ? "Publicada" : "Oculta"}
              </span>
            </div>
            <div className="flex items-end justify-between gap-4 p-6">
              <div>
                <h2 className="font-display text-[24px]">{p.name}</h2>
                <p className="mt-1.5 text-[13.5px] text-ink-45">
                  {money(p.basePrice)} / noche · {covers[p.id]?.length ?? 0} fotos
                </p>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink/6 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:bg-ink group-hover:text-cream">
                <Icon name="edit" className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
