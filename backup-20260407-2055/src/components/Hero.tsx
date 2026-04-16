"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const WA = "https://wa.me/56985627686?text=Hola+kitty+studio!+";
const ease = [0.0, 0.0, 0.2, 1.0] as const;

// Mosaico 5×4 — 20 fotos distribuidas entre las 4 categorías
const mosaic: { src: string; kb: string }[] = [
  { src: "/images/servicios/unas/unas_01.jpg",         kb: "" },
  { src: "/images/servicios/pestanas/pestanas_01.jpg",  kb: "" },
  { src: "/images/servicios/cabello/cabello_01.jpg",    kb: "" },
  { src: "/images/servicios/unas/unas_07.jpg",          kb: "" },
  { src: "/images/servicios/cejas/cejas_01.jpg",        kb: "" },
  { src: "/images/servicios/pestanas/pestanas_05.jpg",  kb: "" },
  { src: "/images/servicios/unas/unas_12.jpg",          kb: "" },
  { src: "/images/servicios/cabello/cabello_06.jpg",    kb: "" },
  { src: "/images/servicios/cejas/cejas_02.jpg",        kb: "" },
  { src: "/images/servicios/unas/unas_19.jpg",          kb: "" },
  { src: "/images/servicios/cabello/cabello_11.jpg",    kb: "" },
  { src: "/images/servicios/pestanas/pestanas_09.jpg",  kb: "" },
  { src: "/images/servicios/unas/unas_25.jpg",          kb: "" },
  { src: "/images/servicios/cejas/cejas_03.jpg",        kb: "" },
  { src: "/images/servicios/cabello/cabello_16.jpg",    kb: "" },
  { src: "/images/servicios/pestanas/pestanas_13.jpg",  kb: "" },
  { src: "/images/servicios/unas/unas_29.jpg",          kb: "" },
  { src: "/images/servicios/cabello/cabello_20.jpg",    kb: "" },
  { src: "/images/servicios/cejas/cejas_04.jpg",        kb: "" },
  { src: "/images/servicios/pestanas/pestanas_17.jpg",  kb: "" },
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
              style={{ objectFit: "cover" }}
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
            "radial-gradient(ellipse 85% 75% at 50% 50%, rgba(26,20,20,0.55) 0%, rgba(26,20,20,0.93) 100%)",
        }}
      />
      {/* Top gradient so navbar blends in */}
      <div
        className="absolute inset-x-0 top-0 h-28"
        style={{ background: "linear-gradient(to bottom, rgba(26,20,20,0.7) 0%, transparent 100%)" }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-16">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="font-body text-xs tracking-[0.4em] uppercase mb-6 font-medium"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          Viña del Mar &nbsp;·&nbsp; Belleza &amp; Moda
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
          className="font-heading font-light text-[clamp(3.5rem,9vw,8rem)] tracking-[0.2em] leading-[0.95] text-white uppercase"
        >
          Kitty<br />Studio
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease, delay: 0.24 }}
          className="font-body text-base md:text-lg max-w-lg mx-auto mb-12 leading-relaxed mt-8"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Uñas, pestañas, cejas, cabello, depilación y más.
          Con el detalle que mereces.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.36 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#servicios"
            className="border border-white/75 text-white tracking-[0.18em] text-xs uppercase px-8 py-3.5 hover:bg-white/10 transition-colors"
          >
            Ver servicios
          </a>
          <a
            href={WA}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#C4973D] text-[#1A1414] font-medium tracking-[0.18em] text-xs uppercase px-8 py-3.5 transition-opacity hover:opacity-85"
          >
            Reservar hora
          </a>
        </motion.div>
      </div>
    </section>
  );
}
