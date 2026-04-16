"use client";

import { motion } from "framer-motion";
import { Sparkles, Eye, Feather, Scissors, Zap, Smile, TrendingUp, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const WA = "https://wa.me/56985627686?text=%C2%A1Hola+Kitty+Studio!";
const ease = [0.0, 0.0, 0.2, 1.0] as const;

type Service = {
  name: string;
  price: string;
  desc: string;
  Icon: LucideIcon;
};

const services: Service[] = [
  { name: "UÑAS",          price: "Desde $10.000",      Icon: Sparkles,    desc: "Esmaltado, kapping, soft gel, polygel, acrílicas" },
  { name: "PESTAÑAS",      price: "Desde $25.000",      Icon: Eye,         desc: "Clásicas, volumen, wispy, foxy eyes, lifting" },
  { name: "CEJAS",         price: "Desde $6.000",       Icon: Feather,     desc: "Perfilado, henna, laminado, epilación con hilo" },
  { name: "CABELLO",       price: "Desde $2.000/mecha", Icon: Scissors,    desc: "Extensiones, mantención, hidratación, encapsulado" },
  { name: "DEPILACIÓN",    price: "Desde $1.000",       Icon: Zap,         desc: "Cera para rostro y cuerpo completo" },
  { name: "FACIAL",        price: "Desde $20.000",      Icon: Smile,       desc: "Limpieza facial, peeling químico, dermapen" },
  { name: "LIFTING",       price: "Desde $20.000",      Icon: TrendingUp,  desc: "Lifting de pestañas con tinte y botox" },
  { name: "MASAJES",       price: "$20.000",             Icon: Heart,       desc: "Masajes con piedras calientes, espalda y piernas" },
];

export default function Servicios() {
  return (
    <section id="servicios" className="py-16 md:py-24 px-4 md:px-6" style={{ backgroundColor: "#F5EFF0" }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
          className="mb-10 md:mb-14"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase font-medium mb-3" style={{ color: "#A67C2A" }}>
            Lo que hacemos
          </p>
          <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl" style={{ color: "#1A1A1A" }}>
            SERVICIOS
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px" style={{ backgroundColor: "rgba(26,26,26,0.06)" }}>
          {services.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, ease, delay: i * 0.05 }}
              className="group relative flex flex-col items-start p-4 md:p-6 lg:p-8 transition-colors duration-200"
              style={{ backgroundColor: "#FFFFFF" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F7F4F2")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
            >
              {/* Corner brackets */}
              <span className="absolute top-0 left-0 w-5 h-5 border-t border-l" style={{ borderColor: "#A67C2A" }} />
              <span className="absolute top-0 right-0 w-5 h-5 border-t border-r" style={{ borderColor: "#A67C2A" }} />
              <span className="absolute bottom-0 left-0 w-5 h-5 border-b border-l" style={{ borderColor: "#A67C2A" }} />
              <span className="absolute bottom-0 right-0 w-5 h-5 border-b border-r" style={{ borderColor: "#A67C2A" }} />

              {/* Icon */}
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-4 md:mb-6 transition-colors duration-200"
                style={{ backgroundColor: "rgba(166,124,42,0.08)" }}
              >
                <s.Icon
                  size={22}
                  strokeWidth={1.5}
                  style={{ color: "#A67C2A" }}
                />
              </div>

              {/* Name */}
              <h3 className="font-heading text-sm sm:text-lg md:text-xl lg:text-2xl mb-2 leading-tight" style={{ color: "#1A1A1A", letterSpacing: "0.05em" }}>
                {s.name}
              </h3>

              {/* Description */}
              <p className="font-body text-xs leading-relaxed mb-5 flex-1" style={{ color: "#6b5c68" }}>
                {s.desc}
              </p>

              {/* Price */}
              <p className="font-body text-sm font-semibold" style={{ color: "#A67C2A" }}>
                {s.price}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4"
        >
          <a
            href="/precios"
            className="inline-flex items-center gap-2 px-7 py-3.5 font-body text-xs tracking-[0.12em] uppercase font-semibold border transition-all duration-200 hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A]"
            style={{ borderColor: "#1A1A1A", color: "#1A1A1A" }}
          >
            Ver lista de precios completa
          </a>
          <a
            href={WA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 font-body text-xs tracking-[0.12em] uppercase font-semibold text-white transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: "#A67C2A" }}
          >
            Reservar hora
          </a>
        </motion.div>
      </div>
    </section>
  );
}
