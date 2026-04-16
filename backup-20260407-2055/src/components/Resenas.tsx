"use client";

import { motion } from "framer-motion";

const ease = [0.0, 0.0, 0.2, 1.0] as const;

const testimonios = [
  {
    nombre: "Valentina Morales",
    servicio: "Extensiones de pestañas",
    texto: "Vine por las pestañas wispy y quedé encantada. El resultado fue exactamente lo que pedí y el ambiente del salón te hace sentir como en casa. Ya agendé para el mes que viene.",
    inicial: "V",
  },
  {
    nombre: "Catalina Rojas",
    servicio: "Uñas polygel",
    texto: "Llevo tres meses yendo y jamás he salido decepcionada. Las uñas polygel me duran perfecto y los diseños siempre quedan bonitos. Súper detallista la chica que me atiende.",
    inicial: "C",
  },
  {
    nombre: "Gabriela Soto",
    servicio: "Laminado de cejas + facial",
    texto: "Me hice el laminado de cejas y la limpieza facial profunda el mismo día. Las cejas quedaron increíbles y mi piel brillaba al salir. Volví a la semana siguiente con mi mamá.",
    inicial: "G",
  },
  {
    nombre: "Javiera Fuentes",
    servicio: "Extensiones de cabello",
    texto: "Tenía miedo de las extensiones porque en otros lugares me habían quedado mal, pero acá quedaron naturales y combinadas a la perfección. La atención es muy buena.",
    inicial: "J",
  },
];

const StarRow = () => (
  <div className="flex gap-0.5" aria-label="5 estrellas">
    {[...Array(5)].map((_, i) => (
      <svg key={i} viewBox="0 0 20 20" className="w-3.5 h-3.5" aria-hidden="true">
        <path fill="#C4973D" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function Resenas() {
  return (
    <section id="resenas" className="py-24 px-6" style={{ backgroundColor: "#FFFCFD" }}>
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
            Lo que dicen nuestras clientas
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            <h2 className="font-heading text-5xl md:text-6xl leading-none" style={{ color: "#1A1414" }}>
              RESEÑAS
            </h2>
            <div className="flex items-center gap-2 pb-1">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" className="w-4 h-4" aria-hidden="true">
                    <path fill="#C4973D" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="font-body text-sm font-semibold" style={{ color: "#1A1414" }}>5.0</span>
              <span className="font-body text-xs" style={{ color: "#7A6A6A" }}>Google</span>
            </div>
          </div>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {testimonios.map((t, i) => (
            <motion.article
              key={t.nombre}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.52, ease, delay: i * 0.08 }}
              className="bg-white rounded-none p-8"
              style={{ boxShadow: "0 2px 20px rgba(26,20,20,0.06)" }}
            >
              <div className="mb-5">
                <StarRow />
              </div>
              <blockquote className="font-body text-base leading-relaxed mb-6 italic" style={{ color: "#1A1414" }}>
                &ldquo;{t.texto}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-none flex items-center justify-center font-heading text-lg text-[#1A1414] shrink-0"
                  style={{ backgroundColor: "#C4973D" }}
                  aria-hidden="true"
                >
                  {t.inicial}
                </div>
                <div>
                  <p className="font-heading text-xl leading-none" style={{ color: "#C4973D", letterSpacing: "0.04em" }}>{t.nombre.toUpperCase()}</p>
                  <p className="font-body text-xs mt-0.5" style={{ color: "#7A6A6A" }}>{t.servicio}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
