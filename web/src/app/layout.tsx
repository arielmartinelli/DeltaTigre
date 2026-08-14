import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Delta Tigre — Cabañas sobre el Arroyo Gambado",
    template: "%s · Delta Tigre",
  },
  description:
    "Dos casas de madera con deck y bajada al arroyo sobre el Arroyo Gambado, primera sección del Delta de Tigre. Reservá online o por WhatsApp.",
  keywords: ["cabañas Tigre", "Delta de Tigre", "alquiler Delta", "Arroyo Gambado", "cabañas río", "escapada Buenos Aires"],
  openGraph: {
    type: "website", locale: "es_AR", siteName: "Delta Tigre",
    title: "Delta Tigre — Cabañas sobre el Arroyo Gambado",
    description: "Dos casas de madera con deck y galería en el Delta de Tigre.",
    images: ["/img/delta-uno/13.webp"],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: "/" },
  // Search Console: pegar el código en NEXT_PUBLIC_GOOGLE_VERIFICATION
  verification: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION }
    : undefined,
  icons: { icon: "/brand/logo.png", apple: "/brand/logo.png" },
};

export const viewport: Viewport = { themeColor: "#f5f3e6", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..600&family=Plus+Jakarta+Sans:ital,wght@0,300..700;1,300..600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain">{children}</body>
    </html>
  );
}
