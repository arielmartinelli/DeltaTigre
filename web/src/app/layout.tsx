import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Delta Tigre — Cabanas sobre el Arroyo Gambado",
    template: "%s · Delta Tigre",
  },
  description:
    "Dos casas de madera con deck y muelle propio sobre el Arroyo Gambado, primera seccion del Delta de Tigre. Reserva online o por WhatsApp.",
  keywords: ["cabanas Tigre", "Delta de Tigre", "alquiler Delta", "Arroyo Gambado", "cabanas rio", "escapada Buenos Aires"],
  openGraph: {
    type: "website", locale: "es_AR", siteName: "Delta Tigre",
    title: "Delta Tigre — Cabanas sobre el Arroyo Gambado",
    description: "Dos casas de madera con deck y muelle propio en el Delta de Tigre.",
    images: ["/img/delta-uno/13.webp"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/brand/logo.png", apple: "/brand/logo.png" },
};

export const viewport: Viewport = { themeColor: "#f5f3e6", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([getSession(), getSettings()]);
  return (
    <html lang="es-AR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..600&family=Sacramento&family=Plus+Jakarta+Sans:ital,wght@0,300..700;1,300..600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain">
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
      </body>
    </html>
  );
}
