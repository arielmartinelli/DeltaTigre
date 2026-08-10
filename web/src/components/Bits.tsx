import Icon from "./Icon";

export function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span className={`tag ${dark ? "bg-cream/10 text-cream/70" : "bg-palm-wash text-palm-deep"}`}>
      <span className={`h-1 w-1 rounded-full ${dark ? "bg-cream/60" : "bg-palm"}`} />
      {children}
    </span>
  );
}

export function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <Icon name="star" className="h-3.5 w-3.5 text-palm" />
      <span className="tabular-nums font-medium">{value.toFixed(1).replace(".", ",")}</span>
    </span>
  );
}

export function Divider() {
  return <div className="mx-auto h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-ink/12 to-transparent" />;
}

export function Field({
  label, children, hint,
}: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-ink-45">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[12px] text-ink-45">{hint}</span>}
    </label>
  );
}

export const inputCx =
  "w-full rounded-2xl bg-paper px-4 py-3 text-[15px] hairline transition-all duration-400 " +
  "ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-ink-45/60 focus:shadow-[0_0_0_3px_rgba(92,140,60,0.16)] focus:outline-none";

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pendiente: "bg-ink/6 text-ink-70",
    confirmada: "bg-palm-wash text-palm-deep",
    rechazada: "bg-[#f3e2dd] text-[#8a3a24]",
    cancelada: "bg-ink/6 text-ink-45 line-through",
  };
  return <span className={`tag ${map[status] ?? map.pendiente}`}>{status}</span>;
}
