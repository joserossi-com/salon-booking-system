import Navbar from "@/components/Navbar";
import Equipo from "@/components/Equipo";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Equipo — Kitty Studio Viña del Mar",
  description:
    "Conoce al equipo de Kitty Studio: Kitty, Nicole y Constanza. Especialistas en pestañas, uñas, cabello, cejas, facial y más en Viña del Mar.",
};

export default function EquipoPage() {
  return (
    <>
      <Navbar />
      <main>
        <section
          className="pt-28 md:pt-32 pb-12 md:pb-16 px-4 md:px-6"
          style={{ backgroundColor: "#F5EFF0" }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <p
              className="font-body text-[11px] sm:text-xs tracking-[0.3em] sm:tracking-[0.35em] uppercase font-medium mb-4"
              style={{ color: "#A67C2A" }}
            >
              Nuestro equipo
            </p>
            <h1
              className="font-heading leading-none mb-4 break-words"
              style={{ fontSize: "clamp(3rem, 10vw, 7rem)", letterSpacing: "0.1em", color: "#1A1A1A" }}
            >
              EQUIPO
            </h1>
            <p className="font-body text-sm sm:text-base" style={{ color: "#6b5c68" }}>
              Las profesionales detrás de Kitty Studio
            </p>
          </div>
        </section>

        <Equipo />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
