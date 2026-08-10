import Link from "next/link";
import Icon from "./Icon";

type Variant = "solid" | "ghost" | "outline" | "wa";
const base =
  "group relative inline-flex items-center gap-3 rounded-full pl-6 pr-2 py-2 text-[13px] font-medium tracking-[0.01em] " +
  "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.975] select-none";

const styles: Record<Variant, string> = {
  solid: "bg-ink text-cream hover:bg-palm-deep",
  outline: "text-ink hairline hover:bg-ink hover:text-cream",
  ghost: "text-ink hover:bg-ink/5",
  wa: "bg-palm text-paper hover:bg-palm-deep",
};
const dot: Record<Variant, string> = {
  solid: "bg-cream/12 text-cream",
  outline: "bg-ink/6 text-current group-hover:bg-cream/15",
  ghost: "bg-ink/6 text-ink",
  wa: "bg-paper/18 text-paper",
};

export function CTA({
  href, children, variant = "solid", icon = "arrow", className = "", target,
}: {
  href: string; children: React.ReactNode; variant?: Variant; icon?: string; className?: string; target?: string;
}) {
  return (
    <Link href={href} target={target} rel={target ? "noopener noreferrer" : undefined}
      className={`${base} ${styles[variant]} ${className}`}>
      <span>{children}</span>
      <span className={`grid h-8 w-8 place-items-center rounded-full ${dot[variant]}
        transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105`}>
        <Icon name={icon} className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

export function ActionButton({
  children, variant = "solid", icon = "arrow", className = "", ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; icon?: string }) {
  return (
    <button {...rest} className={`${base} ${styles[variant]} disabled:opacity-40 disabled:pointer-events-none ${className}`}>
      <span>{children}</span>
      <span className={`grid h-8 w-8 place-items-center rounded-full ${dot[variant]}
        transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105`}>
        <Icon name={icon} className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
