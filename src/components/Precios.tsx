"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

const WA_URL = "https://wa.me/56985627686?text=%C2%A1Hola+Kitty+Studio!";

type PriceItem = {
  name: string;
  price: string;
  badge?: string;
  duracion_minutos?: number;
};

type Category = {
  id: string;
  label: string;
  items: PriceItem[];
};

const categories: Category[] = [
  {
    id: "unas",
    label: "Uñas",
    items: [
      { name: "Esmaltado 1 diseño", price: "$10.000", duracion_minutos: 45 },
      { name: "Kapping 1 diseño (acrílico o polygel)", price: "$20.000", duracion_minutos: 90 },
      { name: "Soft gel 1 diseño", price: "$20.000", duracion_minutos: 90 },
      { name: "Polygel con tips 1 diseño", price: "$23.000", duracion_minutos: 120 },
      { name: "Acrílicas con tips 1 diseño", price: "$23.000", duracion_minutos: 120 },
      { name: "Acrílicas esculpidas 1 diseño", price: "$25.000", duracion_minutos: 150 },
      { name: "Parafinoterapia", price: "$5.000", duracion_minutos: 20 },
      { name: "Manicura limpieza", price: "$8.000", duracion_minutos: 30 },
      { name: "Pedicura limpieza", price: "$10.000", duracion_minutos: 45 },
      { name: "Pedicura + esmaltado", price: "$15.000", duracion_minutos: 60 },
      { name: "Retiro esmaltado", price: "$5.000", duracion_minutos: 20 },
      { name: "Retiro kapping/soft gel/polygel/acrílicas (en Kitty Studio)", price: "$5.000", duracion_minutos: 20 },
      { name: "Retiro kapping/soft gel/polygel/acrílicas (otro lugar)", price: "$10.000", duracion_minutos: 30 },
    ],
  },
  {
    id: "pestanas",
    label: "Pestañas",
    items: [
      { name: "Extensiones clásicas", price: "$25.000", duracion_minutos: 120 },
      { name: "Extensiones rímel", price: "$25.000", duracion_minutos: 120 },
      { name: "Extensiones máscara", price: "$30.000", duracion_minutos: 120 },
      { name: "Extensiones hawaianas (Y)", price: "$30.000", duracion_minutos: 120 },
      { name: "Extensiones egipcias (3D)", price: "$30.000", duracion_minutos: 150 },
      { name: "Extensiones griegas (4D)", price: "$30.000", duracion_minutos: 150 },
      { name: "Extensiones volumen (5D)", price: "$32.000", duracion_minutos: 150 },
      { name: "Extensiones foxy eyes (L)", price: "$35.000", duracion_minutos: 150 },
      { name: "Extensiones wispy", price: "$35.000", duracion_minutos: 150 },
      { name: "Retiro (al venir por nuevo set)", price: "Gratis", duracion_minutos: 20 },
      { name: "Retiro solo", price: "$5.000", duracion_minutos: 20 },
      { name: "Lifting de pestañas", price: "$20.000", duracion_minutos: 60 },
      { name: "Lifting con tinte", price: "$23.000", duracion_minutos: 75 },
      { name: "Lifting con botox", price: "$23.000", duracion_minutos: 75 },
      { name: "Lifting con tinte y botox", price: "$25.000", duracion_minutos: 75 },
    ],
  },
  {
    id: "cejas",
    label: "Cejas",
    items: [
      { name: "Perfilado de cejas", price: "$6.000", duracion_minutos: 20 },
      { name: "Perfilado con henna", price: "$10.000", duracion_minutos: 40 },
      { name: "Laminado de cejas", price: "$20.000", duracion_minutos: 60 },
      { name: "Epilación con hilo rostro completo", price: "$12.000", duracion_minutos: 20 },
    ],
  },
  {
    id: "cabello",
    label: "Cabello",
    items: [
      { name: "Postura extensiones 100–140grs", price: "$30.000" },
      { name: "Por cada 10grs extra", price: "+$2.000" },
      { name: "Mantención (retiro + lavado + instalación hasta 140grs)", price: "$50.000" },
      { name: "Hidratación por mecha (reparación)", price: "$300" },
      { name: "Encapsulado por mecha", price: "$500" },
      { name: "Retiro", price: "$20.000" },
      { name: "Retiro y lavado", price: "$25.000" },
      { name: "Extensión por mecha – 1gr (instalación incluida)", price: "$2.000" },
    ],
  },
  {
    id: "depilacion",
    label: "Depilación",
    items: [
      { name: "Cejas", price: "$3.000" },
      { name: "Entre cejas", price: "$1.000" },
      { name: "Pómulos", price: "$2.000" },
      { name: "Frente", price: "$2.000" },
      { name: "Patillas", price: "$3.000" },
      { name: "Bozo", price: "$2.000" },
      { name: "Rostro completo", price: "$6.000" },
      { name: "Manos / dedos / empeine", price: "$2.000" },
      { name: "Glúteo", price: "$4.000" },
      { name: "Nuca / pecho", price: "$4.000" },
      { name: "Medio brazo", price: "$5.000" },
      { name: "Brazo completo", price: "$8.000" },
      { name: "Media espalda / medio abdomen", price: "$5.000" },
      { name: "Media pierna", price: "$6.000" },
      { name: "Pierna completa", price: "$10.000" },
      { name: "Espalda completa", price: "$8.000" },
      { name: "Axila", price: "$3.000" },
      { name: "Cadera", price: "$4.000" },
      { name: "Rebaje corto", price: "$6.000" },
      { name: "Rebaje especial", price: "$10.000" },
    ],
  },
  {
    id: "facial",
    label: "Facial",
    items: [
      { name: "Limpieza facial básica", price: "$20.000", duracion_minutos: 75 },
      { name: "Limpieza facial profunda", price: "$30.000", duracion_minutos: 75 },
      { name: "Adicional cóctel de vitaminas", price: "$5.000" },
      { name: "Limpieza profunda + inducción de principios activos coreanos con Dermapen", price: "$40.000", duracion_minutos: 90 },
      { name: "Peeling químico", price: "$60.000", duracion_minutos: 90 },
    ],
  },
  {
    id: "despigmentacion",
    label: "Despigmentación",
    items: [
      { name: "Rostro — por sesión", price: "$40.000", duracion_minutos: 90 },
      { name: "Rostro — Pack 3 sesiones", price: "$100.000", badge: "Pack ahorro", duracion_minutos: 90 },
      { name: "Cuello — por sesión", price: "$35.000", duracion_minutos: 90 },
      { name: "Cuello — Pack 3 sesiones", price: "$80.000", badge: "Pack ahorro", duracion_minutos: 90 },
      { name: "Axila — por sesión", price: "$30.000", duracion_minutos: 90 },
      { name: "Axila — Pack 3 sesiones", price: "$70.000", badge: "Pack ahorro", duracion_minutos: 90 },
      { name: "Íntimo — por sesión", price: "$40.000", duracion_minutos: 90 },
      { name: "Íntimo — Pack 3 sesiones", price: "$100.000", badge: "Pack ahorro", duracion_minutos: 90 },
    ],
  },
  {
    id: "otros",
    label: "Otros",
    items: [
      { name: "Acrocordones (1–5)", price: "$25.000", duracion_minutos: 45 },
      { name: "Acrocordones (6–20)", price: "$35.000", duracion_minutos: 45 },
      { name: "Acrocordones (21–40)", price: "$45.000", duracion_minutos: 60 },
      { name: "Masaje con piedras calientes (espalda, piernas y brazos)", price: "$20.000", duracion_minutos: 75 },
    ],
  },
];

function PriceRow({ item }: { item: PriceItem }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-dashed border-[#e0d5cc] last:border-0 gap-2 sm:gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-body text-xs sm:text-sm text-[#1A1A1A] leading-snug">{item.name}</span>
        {item.badge && (
          <span
            className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(166,124,42,0.1)", color: "#A67C2A" }}
          >
            {item.badge}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {item.duracion_minutos && (
          <span className="font-body text-xs text-[#6b5c68] whitespace-nowrap">
            {item.duracion_minutos} min
          </span>
        )}
        <span className="font-body text-xs sm:text-sm font-semibold text-[#1A1A1A] whitespace-nowrap">
          {item.price}
        </span>
      </div>
    </div>
  );
}

export default function Precios() {
  const [activeTab, setActiveTab] = useState(categories[0].id);

  const activeCategory = categories.find((c) => c.id === activeTab)!;

  return (
    <section id="precios" className="py-16 md:py-24 px-4 md:px-6" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.0, 0.0, 0.2, 1.0] as const }}
          className="text-center mb-10 md:mb-12"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase font-medium mb-3" style={{ color: "#A67C2A" }}>
            Lista completa
          </p>
          <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl" style={{ color: "#1A1A1A" }}>
            PRECIOS
          </h2>
          <div className="mt-4 w-12 h-0.5 mx-auto" style={{ backgroundColor: "#A67C2A" }} />
        </motion.div>

        {/* Tabs — scrollable on mobile */}
        <div className="flex gap-2 overflow-x-auto md:flex-wrap pb-2 mb-6 md:mb-8 md:justify-center -mx-4 px-4 md:mx-0 md:px-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={
                activeTab === cat.id
                  ? { backgroundColor: "#A67C2A", color: "#fff" }
                  : { border: "1px solid rgba(166,124,42,0.3)", color: "#A67C2A", backgroundColor: "transparent" }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="bg-white rounded-2xl border border-[#e0d5cc] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.0, 0.0, 0.2, 1.0] as const }}
              className="p-4 md:p-6 lg:p-8"
            >
              <h3 className="font-heading text-xl font-semibold mb-6" style={{ color: "#1A1A1A" }}>
                {activeCategory.label}
              </h3>
              <div>
                {activeCategory.items.map((item) => (
                  <PriceRow key={item.name} item={item} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center font-body text-xs text-[#6b5c68]">
          Precios en pesos chilenos (CLP). Consulta disponibilidad y promociones por WhatsApp.
        </p>

        {/* CTA */}
        <div className="mt-8 text-center">
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-body font-semibold text-sm text-white transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-sm"
            style={{ backgroundColor: "#A67C2A" }}
          >
            Reservar hora
          </a>
        </div>
      </div>
    </section>
  );
}
