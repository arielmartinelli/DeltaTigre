"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "./Icon";
import type { SessionUser } from "@/lib/session";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/cabanas", label: "Las cabanas" },
  { href: "/ubicacion", label: "Ubicacion" },
  { href: "/experiencias", label: "Que hacer" },
];

export default function Nav({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const path = usePathname();

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  useEffect(() => {
    const el = document.createElement("div");
    el.style.cssText = "position:absolute;top:64px;height:1px;width:1px;pointer-events:none";
    document.body.appendChild(el);
    const io = new IntersectionObserver(([e]) => setSolid(!e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => { io.disconnect(); el.remove(); };
  }, []);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4">
        <nav
          className={`pointer-events-auto mt-4 flex w-full max-w-5xl items-center gap-2 rounded-full py-2 pl-2.5 pr-2
            bg-paper/80 backdrop-blur-xl hairline
            transition-shadow duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${solid ? "shadow-[0_14px_44px_-24px_rgba(16,18,14,0.55)]" : "shadow-[0_6px_24px_-20px_rgba(16,18,14,0.4)]"}`}
        >
          <Link href="/" className="group flex items-center gap-2.5 rounded-full pr-3">
            <span className="relative grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-paper hairline transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105">
              <Image src="/brand/logo.webp" alt="Delta Tigre" width={96} height={96} className="h-full w-full object-cover" priority />
            </span>
            <span className="display text-[19px] leading-none">Delta Tigre</span>
          </Link>

          <div className="ml-auto hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
              return (
                <Link key={l.href} href={l.href}
                  className={`relative rounded-full px-4 py-2 text-[13px] transition-colors duration-400
                    ${active ? "text-ink" : "text-ink-45 hover:text-ink"}`}>
                  {l.label}
                  <span className={`absolute inset-x-3 -bottom-0.5 h-px origin-left bg-palm transition-transform duration-600 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${active ? "scale-x-100" : "scale-x-0"}`} />
                </Link>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-2 md:ml-2">
            {user ? (
              <Link href="/mi-cuenta"
                className="group hidden items-center gap-2 rounded-full bg-ink py-2 pl-4 pr-2 text-[13px] text-cream transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-palm-deep active:scale-[0.97] sm:flex">
                <span>{user.name.split(" ")[0]}</span>
                <span className="grid h-7 w-7 place-items-center rounded-full bg-cream/12 transition-transform duration-500 group-hover:translate-x-0.5">
                  <Icon name="users" className="h-3.5 w-3.5" />
                </span>
              </Link>
            ) : (
              <Link href="/ingresar"
                className="group hidden items-center gap-2 rounded-full bg-ink py-2 pl-4 pr-2 text-[13px] text-cream transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-palm-deep active:scale-[0.97] sm:flex">
                <span>Ingresar</span>
                <span className="grid h-7 w-7 place-items-center rounded-full bg-cream/12 transition-transform duration-500 group-hover:translate-x-0.5">
                  <Icon name="arrow" className="h-3.5 w-3.5" />
                </span>
              </Link>
            )}

            <button onClick={() => setOpen((v) => !v)} aria-label="Menu" aria-expanded={open}
              className="relative grid h-10 w-10 place-items-center rounded-full hairline bg-paper/60 md:hidden">
              <span className={`absolute h-px w-4 bg-ink transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "translate-y-0 rotate-45" : "-translate-y-[3px]"}`} />
              <span className={`absolute h-px w-4 bg-ink transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "translate-y-0 -rotate-45" : "translate-y-[3px]"}`} />
            </button>
          </div>
        </nav>
      </header>

      {/* Overlay de menu */}
      <div
        className={`fixed inset-0 z-30 bg-cream/85 backdrop-blur-2xl transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] md:hidden
          ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div className="flex h-full flex-col justify-center px-8">
          {[...links, user
            ? { href: "/mi-cuenta", label: "Mi cuenta" }
            : { href: "/ingresar", label: "Ingresar" }].map((l, i) => (
            <div key={l.href} className="overflow-hidden">
              <Link href={l.href}
                className="block py-3 font-display text-[clamp(2rem,10vw,3.25rem)] leading-[1.05] tracking-tight transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:translate-x-2"
                style={{
                  transitionDelay: `${80 + i * 60}ms`,
                  transform: open ? "translateY(0)" : "translateY(110%)",
                  opacity: open ? 1 : 0,
                  transitionProperty: "transform, opacity",
                }}>
                {l.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
