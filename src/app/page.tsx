import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Servicios from "@/components/Servicios";
import Nosotros from "@/components/Nosotros";
import Equipo from "@/components/Equipo";
import Galeria from "@/components/Galeria";
import Resenas from "@/components/Resenas";
import Contacto from "@/components/Contacto";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Servicios />
        <Nosotros />
        <Equipo />
        <Galeria />
        <Resenas />
        <Contacto />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
