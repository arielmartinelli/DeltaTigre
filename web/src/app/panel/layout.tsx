import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Icon from "@/components/Icon";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/app/actions";

export const metadata: Metadata = { title: "Panel del propietario", robots: { index: false } };

const tabs = [
  { href: "/panel", label: "Reservas", icon: "cal" },
  { href: "/panel/cabanas", label: "Alojamientos", icon: "home" },
  { href: "/panel/contenido", label: "Contenido", icon: "edit" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/ingresar");
  if (session.role !== "owner") redirect("/mi-cuenta");

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32 md:px-8 md:pt-36">
      <header className="flex flex-col gap-6 border-b border-ink/8 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="tag bg-palm-wash text-palm-deep"><span className="h-1 w-1 rounded-full bg-palm" />Panel del propietario</span>
          <h1 className="mt-4 font-display text-[clamp(2.15rem,5.1vw,3.35rem)] leading-none">Delta Tigre</h1>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/" className="ul-slide text-[13px] text-ink-45 hover:text-ink">Ver el sitio</Link>
          <form action={logoutAction}>
            <button className="ul-slide text-[13px] text-ink-45 hover:text-ink">Salir</button>
          </form>
        </div>
      </header>

      <nav className="no-scrollbar mt-6 flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href}
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-paper px-4 py-2 text-[13px] hairline transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink hover:text-cream">
            <Icon name={t.icon} className="h-4 w-4 text-palm transition-colors group-hover:text-cream" />
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-10">{children}</div>
    </div>
  );
}
