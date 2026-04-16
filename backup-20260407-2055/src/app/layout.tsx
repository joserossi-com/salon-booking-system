import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-heading",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kitty Studio — Salón de Estética en Viña del Mar",
  description:
    "Uñas, pestañas, cejas, depilación, extensiones de cabello y más. Salón de estética en Viña del Mar. Agenda tu hora por WhatsApp al +56 9 8562 7686.",
  keywords: [
    "salón de estética Viña del Mar",
    "uñas Viña del Mar",
    "pestañas Viña del Mar",
    "extensiones de cabello",
    "depilación Valparaíso",
    "facial Viña del Mar",
    "Kitty Studio",
  ],
  authors: [{ name: "Kitty Studio" }],
  openGraph: {
    title: "Kitty Studio — Salón de Estética en Viña del Mar",
    description: "Uñas, pestañas, cejas, depilación, extensiones de cabello y más.",
    locale: "es_CL",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" className={`${cormorant.variable} ${montserrat.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BeautySalon",
              name: "Kitty Studio",
              description: "Salón de estética en Viña del Mar.",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Lonquimay 7",
                addressLocality: "Viña del Mar",
                addressRegion: "Valparaíso",
                addressCountry: "CL",
              },
              telephone: "+56985627686",
              sameAs: ["https://www.instagram.com/kittystudio._/"],
            }),
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
