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
          className="pt-32 pb-16 px-6"
          style={{ backgroundColor: "#1A1414" }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <p
              className="font-body text-xs tracking-[0.35em] uppercase font-medium mb-4"
              style={{ color: "rgba(196,151,61,0.8)" }}
            >
              Lista completa
            </p>
            <h1
              className="font-heading leading-none text-white mb-4"
              style={{ fontSize: "clamp(3.5rem, 9vw, 7rem)", letterSpacing: "0.2em" }}
            >
              PRECIOS
            </h1>
            <p className="font-body text-base" style={{ color: "rgba(255,255,255,0.55)" }}>
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
