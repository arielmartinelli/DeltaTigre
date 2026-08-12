export default function PageHead({
  eyebrow, title, description, action,
}: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-ink/8 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <span className="tag bg-palm-wash text-palm-deep">
            <span className="h-1 w-1 rounded-full bg-palm" />{eyebrow}
          </span>
        )}
        <h1 className="mt-3 font-display text-[clamp(1.7rem,4vw,2.4rem)] leading-none">{title}</h1>
        {description && <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-ink-45">{description}</p>}
      </div>
      {action}
    </header>
  );
}
