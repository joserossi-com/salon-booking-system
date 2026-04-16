"use client";

import { motion } from "framer-motion";
import { Sparkles, Eye, Feather, Scissors, Zap, Smile, TrendingUp, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const WA = "https://wa.me/56985627686?text=Hola+kitty+studio!+";
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
    <section id="servicios" className="py-24 px-6" style={{ backgroundColor: "#FFFCFD" }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
          className="mb-14"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase font-medium mb-3" style={{ color: "#C4973D" }}>
            Lo que hacemos
          </p>
          <h2 className="font-heading text-5xl md:text-6xl" style={{ color: "#1A1414" }}>
            SERVICIOS
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px" style={{ backgroundColor: "rgba(26,20,20,0.08)" }}>
          {services.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, ease, delay: i * 0.05 }}
              className="group flex flex-col items-start p-8 transition-colors duration-200"
              style={{ backgroundColor: "#FFFCFD" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFFCFD")}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-none flex items-center justify-center mb-6 transition-colors duration-200"
                style={{ backgroundColor: "rgba(196,151,61,0.1)" }}
              >
                <s.Icon
                  size={22}
                  strokeWidth={1.5}
                  style={{ color: "#C4973D" }}
                />
              </div>

              {/* Name */}
              <h3 className="font-heading text-3xl mb-2" style={{ color: "#1A1414", letterSpacing: "0.05em" }}>
                {s.name}
              </h3>

              {/* Description */}
              <p className="font-body text-xs leading-relaxed mb-5 flex-1" style={{ color: "#7A6A6A" }}>
                {s.desc}
              </p>

              {/* Price */}
              <p className="font-body text-sm font-semibold" style={{ color: "#C4973D" }}>
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
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <a
            href="/precios"
            className="inline-flex items-center gap-2 px-7 py-3.5 font-body text-sm font-semibold border transition-all duration-200 hover:bg-[#1A1414] hover:text-white hover:border-[#1A1414]"
            style={{ borderColor: "#1A1414", color: "#1A1414" }}
          >
            Ver lista de precios completa
          </a>
          <a
            href={WA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#C4973D] text-[#1A1414] font-medium tracking-[0.18em] text-xs uppercase transition-opacity hover:opacity-85"
          >
            Reservar hora
          </a>
        </motion.div>
      </div>
    </section>
  );
}
