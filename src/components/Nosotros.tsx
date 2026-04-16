"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import ImageFallback from "./ImageFallback";

const WA = "https://wa.me/56985627686?text=%C2%A1Hola+Kitty+Studio!";
const ease = [0.0, 0.0, 0.2, 1.0] as const;

const carouselImages = [
  { src: "/images/nosotros/salon_main.jpg",  alt: "Salón principal de Kitty Studio en Viña del Mar" },
  { src: "/images/nosotros/salon_dep.jpg",   alt: "Sala privada de depilación en Kitty Studio" },
];

export default function Nosotros() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % carouselImages.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="nosotros" className="overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2">

        {/* Left — text */}
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease }}
          className="flex flex-col justify-center py-14 md:py-16 lg:py-20 px-4 md:px-6 lg:px-16"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase font-medium mb-5" style={{ color: "#A67C2A" }}>
            Sobre nosotras
          </p>
          <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl leading-none mb-7" style={{ color: "#1A1A1A" }}>
            BELLEZA<br />CON DETALLE
          </h2>
          <p className="font-body text-base leading-relaxed mb-5" style={{ color: "#6b5c68" }}>
            Somos Kitty Studio, un salón de estética en Viña del Mar donde cada
            clienta recibe atención personalizada. Uñas, pestañas, cejas, cabello
            y más — con técnicas modernas y los mejores materiales.
          </p>
          <p className="font-body text-base leading-relaxed mb-10" style={{ color: "#6b5c68" }}>
            Nuestras profesionales se complementan para que siempre encuentres
            lo que buscas, con la calidad y el cuidado que mereces.
          </p>
          <a
            href={WA}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start px-7 py-3.5 font-body text-xs tracking-[0.12em] uppercase font-semibold text-white transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: "#A67C2A" }}
          >
            Reservar hora
          </a>
        </motion.div>

        {/* Right — fade carousel */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease, delay: 0.1 }}
          className="relative"
          style={{ minHeight: "clamp(260px, 70vw, 480px)" }}
        >
          <AnimatePresence mode="sync">
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease }}
              className="absolute inset-0"
            >
              <ImageFallback
                src={carouselImages[current].src}
                alt={carouselImages[current].alt}
                fill
                style={{ objectFit: "cover", transform: "scale(1.15)" }}
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            </motion.div>
          </AnimatePresence>

          {/* Dot indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {carouselImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Imagen ${i + 1}`}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: i === current ? "#D4899E" : "rgba(255,255,255,0.5)",
                  transform: i === current ? "scale(1.3)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
