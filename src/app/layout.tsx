import type { Metadata } from "next";
import { Cormorant_Garamond, Raleway } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-raleway",
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
    url: "https://kittystudio.vercel.app",
    images: [{ url: "/images/og-cover.jpg", width: 1200, height: 630, alt: "Kitty Studio — Salón de Estética" }],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" className={`${cormorant.variable} ${raleway.variable}`}>
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
              url: "https://kittystudio.vercel.app",
              sameAs: ["https://www.instagram.com/kittystudio._/"],
              openingHoursSpecification: [
                { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], opens: "10:00", closes: "19:00" },
              ],
              paymentAccepted: "Cash, Credit Card, Debit Card, Bank Transfer",
            }),
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
