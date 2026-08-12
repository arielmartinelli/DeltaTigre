"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "@/components/Icon";

const items = [
  { href: "/panel", label: "Reservas", icon: "cal", exact: true },
  { href: "/panel/fechas", label: "Fechas disponibles", icon: "clock" },
  { href: "/panel/cabanas", label: "Alojamientos", icon: "home" },
  { href: "/panel/contenido", label: "Contenido", icon: "edit" },
];

export default function Sidebar({
  name, email, pendientes, logout,
}: { name: string; email: string; pendientes: number; logout: () => Promise<void> }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  const activo = (href: string, exact?: boolean) => (exact ? path === href : path.startsWith(href));

  const nav = (
    <nav className="flex flex-col gap-1">
      {items.map((i) => {
        const on = activo(i.href, i.exact);
        return (
          <Link key={i.href} href={i.href}
            className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]
              ${on ? "bg-ink text-cream" : "text-ink-70 hover:bg-ink/6"}`}>
            <Icon name={i.icon} className={`h-4.5 w-4.5 shrink-0 transition-colors ${on ? "text-palm-soft" : "text-palm"}`} />
            <span className="flex-1">{i.label}</span>
            {i.href === "/panel" && pendientes > 0 && (
              <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] tabular-nums
                ${on ? "bg-cream/15 text-cream" : "bg-palm text-paper"}`}>
                {pendientes}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const pie = (
    <div className="mt-auto space-y-3 pt-6">
      <Link href="/" target="_blank"
        className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[13px] text-ink-45 transition-colors duration-400 hover:bg-ink/6 hover:text-ink">
        <Icon name="view" className="h-4 w-4" />Ver el sitio
      </Link>
      <div className="rounded-2xl bg-ink/4 px-4 py-3">
        <p className="truncate text-[13px] font-medium">{name}</p>
        <p className="truncate text-[11.5px] text-ink-45">{email}</p>
        <form action={logout} className="mt-2">
          <button className="ul-slide text-[12px] text-ink-45 transition-colors hover:text-ink">Cerrar sesión</button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Barra superior en movil */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-ink/8 bg-paper/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button onClick={() => setOpen(true)} aria-label="Abrir menú"
          className="grid h-10 w-10 place-items-center rounded-full hairline">
          <Icon name="menu" className="h-4 w-4" />
        </button>
        <span className="display text-[17px]">Panel</span>
        {pendientes > 0 && (
          <span className="ml-auto grid h-6 min-w-6 place-items-center rounded-full bg-palm px-2 text-[11px] text-paper">
            {pendientes}
          </span>
        )}
      </header>

      {/* Cajon lateral en movil */}
      <div onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm transition-opacity duration-500 lg:hidden
          ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col overflow-y-auto bg-paper px-4 py-6
          transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] lg:hidden
          ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <MarcaPanel />
        <div className="mt-7">{nav}</div>
        {pie}
      </aside>

      {/* Barra lateral fija en escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col overflow-y-auto border-r border-ink/8 bg-paper px-4 py-7 lg:flex">
        <MarcaPanel />
        <div className="mt-8">{nav}</div>
        {pie}
      </aside>
    </>
  );
}

function MarcaPanel() {
  return (
    <Link href="/panel" className="flex items-center gap-3 px-2">
      <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-paper hairline">
        <Image src="/brand/logo.webp" alt="" width={88} height={88} className="h-full w-full object-cover" />
      </span>
      <span>
        <span className="display block text-[18px] leading-none">Delta Tigre</span>
        <span className="block text-[10px] uppercase tracking-[0.18em] text-ink-45">Panel</span>
      </span>
    </Link>
  );
}
