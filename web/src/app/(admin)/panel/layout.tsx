import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Sidebar from "@/components/panel/Sidebar";
import { getOwnerSession } from "@/lib/session";
import { logoutOwnerAction } from "@/app/actions";
import { getAllBookings } from "@/lib/data";

export const metadata: Metadata = { title: "Panel del propietario", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getOwnerSession();
  if (!session) redirect("/propietario");

  const bookings = await getAllBookings().catch(() => []);
  const pendientes = bookings.filter((b) => b.status === "pendiente").length;

  return (
    <div className="flex min-h-[100dvh] bg-shell/50">
      <Sidebar
        name={session.name}
        email={session.email}
        pendientes={pendientes}
        logout={logoutOwnerAction}
      />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-10">{children}</div>
      </div>
    </div>
  );
}
