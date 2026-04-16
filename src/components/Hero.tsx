"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const WA = "https://wa.me/56985627686?text=%C2%A1Hola+Kitty+Studio!";
const ease = [0.0, 0.0, 0.2, 1.0] as const;

// Mosaico 5×4 — 20 fotos, ninguna categoría igual toca otra horizontal o verticalmente
// U=Uñas  P=Pestañas  C=Cabello  E=Cejas
// Row 1:  U01  P01  C01  E01  P02
// Row 2:  C02  E02  P03  U02  C03
// Row 3:  P04  U03  E03  C04  P05
// Row 4:  E01  C05  U04  P01  E02
const mosaic: { src: string; kb: string }[] = [
  // Row 1
  { src: "/images/servicios/unas/unas_01.jpg",          kb: "" }, // U01
  { src: "/images/servicios/pestanas/pestanas_01.jpg",  kb: "" }, // P01
  { src: "/images/servicios/cabello/cabello_01.jpg",    kb: "" }, // C01
  { src: "/images/servicios/cejas/cejas_01.jpg",        kb: "" }, // E01
  { src: "/images/servicios/pestanas/pestanas_02.jpg",  kb: "" }, // P02
  // Row 2
  { src: "/images/servicios/cabello/cabello_02.jpg",    kb: "" }, // C02
  { src: "/images/servicios/cejas/cejas_02.jpg",        kb: "" }, // E02
  { src: "/images/servicios/pestanas/pestanas_03.jpg",  kb: "" }, // P03
  { src: "/images/servicios/unas/unas_02.jpg",          kb: "" }, // U02
  { src: "/images/servicios/cabello/cabello_03.jpg",    kb: "" }, // C03
  // Row 3
  { src: "/images/servicios/pestanas/pestanas_04.jpg",  kb: "" }, // P04
  { src: "/images/servicios/unas/unas_03.jpg",          kb: "" }, // U03
  { src: "/images/servicios/cejas/cejas_03.jpg",        kb: "" }, // E03
  { src: "/images/servicios/cabello/cabello_04.jpg",    kb: "" }, // C04
  { src: "/images/servicios/pestanas/pestanas_05.jpg",  kb: "" }, // P05
  // Row 4
  { src: "/images/servicios/cejas/cejas_01.jpg",        kb: "" }, // E01 (repeat, 3 rows apart)
  { src: "/images/servicios/cabello/cabello_05.jpg",    kb: "" }, // C05
  { src: "/images/servicios/unas/unas_04.jpg",          kb: "" }, // U04
  { src: "/images/servicios/pestanas/pestanas_01.jpg",  kb: "" }, // P01 (repeat, 3 rows apart)
  { src: "/images/servicios/cejas/cejas_02.jpg",        kb: "" }, // E02 (repeat)
];

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: "100svh" }}
    >
      {/* Photo mosaic background — 5 cols × 4 rows */}
      <div className="absolute inset-0 grid grid-cols-5 grid-rows-4">
        {mosaic.map((photo, i) => (
          <div key={i} className="relative overflow-hidden">
            <Image
              src={photo.src}
              alt=""
              fill
              className={photo.kb}
              style={{ objectFit: "cover", transform: "scale(1.15)" }}
              sizes="20vw"
              priority={i < 5}
            />
          </div>
        ))}
      </div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 75% at 50% 50%, rgba(26,20,16,0.45) 0%, rgba(26,20,16,0.82) 100%)",
        }}
      />
      {/* Top gradient so navbar blends in */}
      <div
        className="absolute inset-x-0 top-0 h-28"
        style={{ background: "linear-gradient(to bottom, rgba(26,20,16,0.6) 0%, transparent 100%)" }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 text-center pt-16">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="font-body text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] uppercase mb-5 sm:mb-6 font-medium"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Viña del Mar &nbsp;·&nbsp; Belleza &amp; Moda
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
          className="font-heading text-white leading-none mb-6 sm:mb-8 break-words"
          style={{ fontSize: "clamp(2.75rem, 13vw, 10rem)", letterSpacing: "0.04em" }}
        >
          KITTY STUDIO
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease, delay: 0.24 }}
          className="font-body text-sm sm:text-base md:text-lg max-w-lg mx-auto mb-10 sm:mb-12 leading-relaxed"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Uñas, pestañas, cejas, cabello, depilación y más.
          Con el detalle que mereces.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.36 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto"
        >
          <a
            href="#servicios"
            className="w-full sm:w-auto text-center px-8 sm:px-10 py-4 font-body text-xs tracking-[0.15em] uppercase font-semibold text-white transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: "#1A1A1A" }}
          >
            Ver servicios
          </a>
          <a
            href={WA}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto text-center px-8 sm:px-10 py-4 font-body text-xs tracking-[0.15em] uppercase font-semibold text-white transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: "#A67C2A" }}
          >
            Reservar hora
          </a>
        </motion.div>
      </div>
    </section>
  );
}
