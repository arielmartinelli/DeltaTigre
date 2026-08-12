import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getGuestSession } from "@/lib/session";
import { getSettings } from "@/lib/data";

/** Chrome del sitio publico: navbar y pie. El area administrativa no lo usa. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([getGuestSession(), getSettings()]);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-2 focus:text-cream">
        Saltar al contenido
      </a>
      <Nav user={user} />
      <main id="main">{children}</main>
      <Footer
        wa={settings.whatsapp ?? "5491100000000"}
        email={settings.email ?? "hola@deltatigre.com.ar"}
        instagram={settings.instagram ?? "#"}
      />
    </>
  );
}
