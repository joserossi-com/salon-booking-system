"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ImageFallback from "./ImageFallback";

const IG = "https://www.instagram.com/kittystudio._/";
const ease = [0.0, 0.0, 0.2, 1.0] as const;

type Category = { id: string; label: string; images: { src: string; alt: string }[] };

const categories: Category[] = [
  {
    id: "unas",
    label: "Uñas",
    images: [
      { src: "/images/servicios/unas/unas_01.jpg", alt: "Uñas decoradas" },
      { src: "/images/servicios/unas/unas_02.jpg", alt: "Uñas decoradas" },
      { src: "/images/servicios/unas/unas_03.jpg", alt: "Uñas decoradas" },
      { src: "/images/servicios/unas/unas_04.jpg", alt: "Uñas decoradas" },
      { src: "/images/servicios/unas/unas_05.jpg", alt: "Uñas decoradas" },
    ],
  },
  {
    id: "pestanas",
    label: "Pestañas",
    images: [
      { src: "/images/servicios/pestanas/pestanas_01.jpg", alt: "Extensiones de pestañas" },
      { src: "/images/servicios/pestanas/pestanas_02.jpg", alt: "Extensiones de pestañas" },
      { src: "/images/servicios/pestanas/pestanas_03.jpg", alt: "Extensiones de pestañas" },
      { src: "/images/servicios/pestanas/pestanas_04.jpg", alt: "Extensiones de pestañas" },
      { src: "/images/servicios/pestanas/pestanas_05.jpg", alt: "Extensiones de pestañas" },
    ],
  },
  {
    id: "cejas",
    label: "Cejas",
    images: [
      { src: "/images/servicios/cejas/cejas_01.jpg", alt: "Diseño de cejas" },
      { src: "/images/servicios/cejas/cejas_02.jpg", alt: "Diseño de cejas" },
      { src: "/images/servicios/cejas/cejas_03.jpg", alt: "Diseño de cejas" },
    ],
  },
  {
    id: "cabello",
    label: "Cabello",
    images: [
      { src: "/images/servicios/cabello/cabello_01.jpg", alt: "Tratamiento de cabello" },
      { src: "/images/servicios/cabello/cabello_02.jpg", alt: "Tratamiento de cabello" },
      { src: "/images/servicios/cabello/cabello_03.jpg", alt: "Tratamiento de cabello" },
      { src: "/images/servicios/cabello/cabello_04.jpg", alt: "Tratamiento de cabello" },
      { src: "/images/servicios/cabello/cabello_05.jpg", alt: "Tratamiento de cabello" },
    ],
  },
];

export default function Galeria() {
  const [active, setActive] = useState(categories[0].id);
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(4);

  const cat = categories.find((c) => c.id === active)!;
  const maxIndex = Math.max(0, cat.images.length - perView);

  // Responsive: 4 on desktop, 2 on tablet, 1 on mobile
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setPerView(4);
      else if (window.innerWidth >= 640) setPerView(2);
      else setPerView(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Reset to start when category changes
  useEffect(() => { setIndex(0); }, [active]);

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIndex((i) => Math.min(maxIndex, i + 1)), [maxIndex]);

  const itemWidthPct = 100 / perView;
  const translatePct = -(index * itemWidthPct);

  return (
    <section id="galeria" className="py-16 md:py-24 px-4 md:px-6 overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 md:mb-10"
        >
          <div>
            <p className="font-body text-xs tracking-[0.3em] uppercase font-medium mb-3" style={{ color: "#A67C2A" }}>
              Nuestro trabajo
            </p>
            <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl leading-none" style={{ color: "#1A1A1A" }}>
              GALERÍA
            </h2>
          </div>
          <a
            href={IG}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex font-body text-sm font-medium border-b pb-0.5 transition-colors duration-200 hover:text-[#D4899E] hover:border-[#D4899E]"
            style={{ color: "#6b5c68", borderColor: "rgba(26,26,26,0.2)" }}
          >
            Ver más en @kittystudio._
          </a>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className="px-5 py-2 rounded-full font-body text-sm font-medium transition-all duration-200"
              style={
                active === c.id
                  ? { backgroundColor: "#1A1A1A", color: "#fff" }
                  : { border: "1px solid rgba(26,26,26,0.2)", color: "#6b5c68", backgroundColor: "transparent" }
              }
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Carousel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease }}
          >
            {/* Track wrapper */}
            <div className="relative">
              <div className="overflow-hidden">
                <motion.div
                  className="flex"
                  animate={{ x: `${translatePct}%` }}
                  transition={{ duration: 0.4, ease }}
                >
                  {cat.images.map((img) => (
                    <div
                      key={img.src}
                      className="shrink-0 px-0.5"
                      style={{ width: `${itemWidthPct}%` }}
                    >
                      <div className="group relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
                        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110 scale-[1.15]">
                          <ImageFallback
                            src={img.src}
                            alt={img.alt}
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end p-3">
                          <span
                            className="font-body text-xs font-medium px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ backgroundColor: "rgba(255,255,255,0.9)", color: "#1A1A1A" }}
                          >
                            {img.alt}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Arrow buttons */}
              <button
                onClick={prev}
                disabled={index === 0}
                aria-label="Anterior"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(26,26,26,0.15)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
              >
                <ChevronLeft size={20} style={{ color: "#1A1A1A" }} />
              </button>
              <button
                onClick={next}
                disabled={index >= maxIndex}
                aria-label="Siguiente"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(26,26,26,0.15)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
              >
                <ChevronRight size={20} style={{ color: "#1A1A1A" }} />
              </button>
            </div>

            {/* Dot indicators */}
            {maxIndex > 0 && (
              <div className="flex justify-center gap-1.5 mt-6">
                {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`Página ${i + 1}`}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === index ? "20px" : "6px",
                      height: "6px",
                      backgroundColor: i === index ? "#1A1A1A" : "rgba(26,26,26,0.2)",
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Mobile IG link */}
        <div className="sm:hidden mt-8">
          <a
            href={IG}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-sm"
            style={{ color: "#6b5c68" }}
          >
            Ver más en @kittystudio._
          </a>
        </div>
      </div>
    </section>
  );
}
