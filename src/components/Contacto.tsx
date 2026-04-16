"use client";

import { motion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";

const WA = "https://wa.me/56985627686?text=%C2%A1Hola+Kitty+Studio!";
const ease = [0.0, 0.0, 0.2, 1.0] as const;

export default function Contacto() {
  return (
    <section id="contacto" className="overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2">

        {/* Left — map (full bleed) */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease }}
          className="relative"
          style={{ minHeight: "clamp(280px, 50vw, 400px)" }}
        >
          <iframe
            title="Ubicación Kitty Studio en Viña del Mar"
            src="https://maps.google.com/maps?q=-33.0014855,-71.4891728&z=17&output=embed&hl=es"
            width="100%"
            height="100%"
            style={{ border: 0, display: "block", minHeight: "clamp(280px, 50vw, 400px)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>

        {/* Right — text + CTA */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease, delay: 0.1 }}
          className="flex flex-col justify-center py-14 md:py-16 lg:py-20 px-4 md:px-6 lg:px-16"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase font-medium mb-5" style={{ color: "#A67C2A" }}>
            Encuéntranos
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl leading-[0.95] mb-6" style={{ color: "#1A1A1A" }}>
            ¿LISTA<br />PARA TU<br />MOMENTO?
          </h2>
          <p className="font-body text-base leading-relaxed mb-10" style={{ color: "#6b5c68" }}>
            Agenda directamente por WhatsApp. Respondemos rápido y coordinamos
            el horario que mejor te acomode.
          </p>

          {/* WhatsApp CTA */}
          <a
            href={WA}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start inline-flex items-center gap-3 px-7 py-4 font-body text-xs tracking-[0.15em] uppercase font-semibold text-white transition-all duration-200 hover:opacity-90 mb-12"
            style={{ backgroundColor: "#A67C2A" }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="white" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Reservar por WhatsApp
          </a>

          {/* Info rows */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <MapPin size={18} className="shrink-0 mt-0.5" style={{ color: "#D4899E" }} />
              <div>
                <p className="font-body text-sm font-semibold mb-0.5" style={{ color: "#1A1A1A" }}>Dirección</p>
                <p className="font-body text-sm" style={{ color: "#6b5c68" }}>
                  Lonquimay 7, Viña del Mar, Valparaíso
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock size={18} style={{ color: "#D4899E", marginTop: "2px" }} />
              <div>
                <p className="font-body text-sm font-semibold mb-0.5" style={{ color: "#1A1A1A" }}>Horario</p>
                <p className="font-body text-sm" style={{ color: "#6b5c68" }}>
                  Lunes a sábado, 10:00 a 19:00 hrs<br />
                  Domingos cerrado
                </p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
