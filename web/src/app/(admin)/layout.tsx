/** Area administrativa: sin navbar ni pie del sitio publico. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[100dvh] bg-shell/60">{children}</div>;
}
