import Navbar from "@/components/Navbar";
import Precios from "@/components/Precios";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Precios — Kitty Studio Viña del Mar",
  description:
    "Lista completa de precios de Kitty Studio: uñas, pestañas, cejas, cabello, depilación, facial, despigmentación y más. Salón de estética en Viña del Mar.",
};

export default function PreciosPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section
          className="pt-28 md:pt-32 pb-12 md:pb-16 px-4 md:px-6"
          style={{ backgroundColor: "#F5EFF0" }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <p
              className="font-body text-[11px] sm:text-xs tracking-[0.3em] sm:tracking-[0.35em] uppercase font-medium mb-4"
              style={{ color: "#A67C2A" }}
            >
              Lista completa
            </p>
            <h1
              className="font-heading leading-none mb-4 break-words"
              style={{ fontSize: "clamp(3rem, 10vw, 7rem)", letterSpacing: "0.1em", color: "#1A1A1A" }}
            >
              PRECIOS
            </h1>
            <p className="font-body text-sm sm:text-base" style={{ color: "#6b5c68" }}>
              Todos los servicios de Kitty Studio · Viña del Mar
            </p>
          </div>
        </section>

        <Precios />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
