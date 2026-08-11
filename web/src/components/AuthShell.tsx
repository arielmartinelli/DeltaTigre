import Image from "next/image";
import Reveal from "./Reveal";
import { Eyebrow } from "./Bits";

export default function AuthShell({
  eyebrow, title, subtitle, image, children,
}: { eyebrow: string; title: React.ReactNode; subtitle: string; image: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid min-h-[100dvh] max-w-6xl items-center gap-12 px-5 pb-20 pt-32 md:grid-cols-2 md:px-8 md:pt-36">
      <Reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-6 font-display text-[clamp(2.45rem,6vw,4.2rem)] leading-[1]">{title}</h1>
        <p className="mt-6 max-w-sm text-[15.5px] leading-relaxed text-ink-70">{subtitle}</p>
        <div className="relative mt-10 hidden aspect-[4/3] overflow-hidden rounded-[2rem] hairline md:block">
          <Image src={image} alt="" fill sizes="45vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent" />
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="shell">
          <div className="core p-7 sm:p-9">{children}</div>
        </div>
      </Reveal>
    </div>
  );
}
