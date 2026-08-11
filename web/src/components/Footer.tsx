import Link from "next/link";
import Image from "next/image";
import Icon from "./Icon";
import { waLink } from "@/lib/whatsapp";

export default function Footer({ wa, email, instagram }: { wa: string; email: string; instagram: string }) {
  return (
    <footer className="relative mt-32 bg-ink text-cream">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-cream">
                <Image src="/brand/logo.webp" alt="Delta Tigre" width={128} height={128} className="h-full w-full object-cover" />
              </span>
              <span className="display text-3xl">Delta Tigre</span>
            </div>
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-cream/55">
              Dos casas de madera sobre el Arroyo Gambado, primera seccion del Delta de Tigre.
              Deck propio, monte de sauces y el sonido del agua toda la noche.
            </p>
            <a href={waLink(wa, "Hola! Quiero consultar por Delta Tigre.")} target="_blank" rel="noopener noreferrer"
              className="group mt-8 inline-flex items-center gap-3 rounded-full bg-palm py-2 pl-5 pr-2 text-[13px] text-paper transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-palm-soft hover:text-ink active:scale-[0.97]">
              Escribinos por WhatsApp
              <span className="grid h-8 w-8 place-items-center rounded-full bg-paper/18 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-px">
                <Icon name="wa" className="h-4 w-4" />
              </span>
            </a>
          </div>

          <nav className="md:col-span-3">
            <p className="tag bg-cream/8 text-cream/60">Navegacion</p>
            <ul className="mt-5 space-y-3 text-[15px]">
              {[["/", "Inicio"], ["/cabanas", "Las cabanas"], ["/ubicacion", "Ubicacion"], ["/experiencias", "Que hacer"], ["/mi-cuenta", "Mi cuenta"], ["/panel", "Panel del propietario"]].map(([h, l]) => (
                <li key={h}>
                  <Link href={h} className="ul-slide text-cream/60 transition-colors duration-400 hover:text-cream">{l}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <p className="tag bg-cream/8 text-cream/60">Contacto</p>
            <ul className="mt-5 space-y-4 text-[15px] text-cream/60">
              <li className="flex items-start gap-3"><Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0" /><span>Arroyo Gambado 147 y 486<br />1648 Tigre, Buenos Aires</span></li>
              <li className="flex items-center gap-3"><Icon name="mail" className="h-4 w-4 shrink-0" /><a className="ul-slide hover:text-cream" href={`mailto:${email}`}>{email}</a></li>
              <li className="flex items-center gap-3"><Icon name="ig" className="h-4 w-4 shrink-0" /><a className="ul-slide hover:text-cream" href={instagram} target="_blank" rel="noopener noreferrer">@deltatigre</a></li>
              <li className="flex items-start gap-3"><Icon name="boat" className="mt-0.5 h-4 w-4 shrink-0" /><span>Se llega en lancha desde la Estacion Fluvial de Tigre</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-cream/10 pt-8 text-[12px] text-cream/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Delta Tigre. Todos los derechos reservados.</p>
          <p className="display text-cream/45">Primera seccion del Delta — Tigre, Argentina</p>
        </div>
      </div>
    </footer>
  );
}
