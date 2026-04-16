'use client'

import { motion } from 'framer-motion'

const equipo = [
  {
    numero: "01",
    total: "03",
    cargo: "FUNDADORA",
    nombre: "KITTY",
    especialidades: "FUNDADORA · PESTAÑAS · CEJAS · FACIAL · MICROPIGMENTACIÓN",
    quote: '"FUNDÉ KITTY STUDIO PORQUE CREO QUE CADA MUJER MERECE SENTIRSE INCREÍBLE. ME ESPECIALIZO EN RESALTAR LA BELLEZA NATURAL, CON TÉCNICAS DE PRECISIÓN Y MUCHO CARIÑO."',
    tags: ["EXTENSIONES PESTAÑAS", "LIFTING PESTAÑAS", "DISEÑO DE CEJAS", "LAMINADO CEJAS", "MICROPIGMENTACIÓN", "FACIAL", "EXTENSIONES CABELLO"],
    foto: "/images/equipo/kitty.jpg",
    inicial: "K",
    bgRow: "#F5EFF0",
  },
  {
    numero: "02",
    total: "03",
    cargo: "NAIL ART & DEPILACIÓN",
    nombre: "NICOLE",
    especialidades: "NAIL ART & DEPILACIÓN",
    quote: '"EL NAIL ART ES UNA FORMA DE ARTE QUE LLEVO EN LAS MANOS. ME ENCANTA CREAR DISEÑOS QUE EXPRESEN LA PERSONALIDAD DE CADA CLIENTA, DESDE LO MÁS DELICADO HASTA LO MÁS AUDAZ."',
    tags: ["UÑAS ACRÍLICAS", "POLYGEL", "SOFT GEL", "KAPPING", "NAIL ART", "PEDICURA", "DEPILACIÓN FACIAL"],
    foto: "/images/equipo/nicole.jpg",
    inicial: "N",
    bgRow: "#FFFFFF",
  },
  {
    numero: "03",
    total: "03",
    cargo: "CABELLO & MASAJES",
    nombre: "CONSTANZA",
    especialidades: "CABELLO & MASAJES",
    quote: '"EL CABELLO ES MI LIENZO Y CADA CLIENTA TRAE UNA HISTORIA DISTINTA. TRABAJO PARA QUE SALGAS RENOVADA, CON UN ESTILO QUE TE REPRESENTE Y UN BIENESTAR QUE SE NOTE."',
    tags: ["CORTE Y COLOR", "TRATAMIENTOS", "EXTENSIONES", "MASAJE RELAJANTE", "MASAJE DEPORTIVO", "MASAJE PIEDRAS"],
    foto: "/images/equipo/constanza.jpg",
    inicial: "C",
    bgRow: "#F5EFF0",
  },
]

interface EquipoProps {
  preview?: boolean
}

export default function Equipo({ preview = false }: EquipoProps) {
  const miembros = preview ? equipo.slice(0, 1) : equipo

  return (
    <div style={{ backgroundColor: "#FFFFFF" }}>
      {miembros.map((miembro, index) => (
        <div
          key={miembro.nombre}
          style={{ backgroundColor: miembro.bgRow }}
          className={`flex flex-col lg:flex-row overflow-hidden ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
        >
          {/* Columna foto */}
          <div className="w-full lg:w-2/5 min-h-[240px] md:min-h-[400px] lg:min-h-[600px] flex flex-col items-center justify-center py-10 md:py-16 lg:py-0"
            style={{ backgroundColor: index % 2 === 0 ? 'rgba(245,239,240,0.6)' : 'rgba(255,255,255,0.8)' }}
          >
            {/* Placeholder circular con inicial */}
            <div style={{
              width: 'clamp(120px, 30vw, 160px)',
              height: 'clamp(120px, 30vw, 160px)',
              borderRadius: '50%',
              border: '1px solid #A67C2A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F5EFF0',
            }}>
              <span style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                color: '#A67C2A',
                fontWeight: 400,
                lineHeight: 1,
                letterSpacing: '0.05em',
              }}>
                {miembro.inicial}
              </span>
            </div>
            <p style={{
              fontFamily: 'var(--font-cormorant)',
              fontStyle: 'italic',
              color: '#6b5c68',
              marginTop: '16px',
              fontSize: '0.875rem',
            }}>
              Foto próximamente
            </p>
          </div>

          {/* Columna contenido */}
          <motion.div
            className="flex flex-col justify-center flex-1 min-w-0 px-5 md:px-8 lg:px-16 py-10 md:py-16 lg:py-16"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Contador */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                color: '#A67C2A',
                fontWeight: 500,
              }}>
                {miembro.numero} / {miembro.total}
              </span>
              <div style={{ width: '32px', height: '1px', backgroundColor: 'rgba(196,151,61,0.5)' }} />
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                color: 'rgba(26,20,20,0.7)',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}>
                {miembro.cargo}
              </span>
            </div>

            {/* Nombre */}
            <h2 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(2rem, 6vw, 5rem)',
              fontWeight: 600,
              color: '#1A1A1A',
              lineHeight: 0.9,
              marginBottom: '16px',
              letterSpacing: '0.08em',
              wordBreak: 'break-word',
            }}>
              {miembro.nombre}
            </h2>

            {/* Especialidades */}
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.7rem',
              letterSpacing: '0.18em',
              color: '#A67C2A',
              textTransform: 'uppercase',
              marginBottom: '24px',
              fontWeight: 500,
              lineHeight: 1.7,
              wordBreak: 'break-word',
            }}>
              {miembro.especialidades}
            </p>

            {/* Separador + label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '28px', height: '1px', backgroundColor: '#A67C2A' }} />
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                color: 'rgba(26,20,20,0.65)',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}>
                PASIÓN & ESPECIALIDAD
              </span>
            </div>

            {/* Quote */}
            <blockquote style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(1rem, 2.2vw, 1.4rem)',
              fontStyle: 'italic',
              fontWeight: 300,
              color: '#1A1A1A',
              lineHeight: 1.7,
              letterSpacing: '0.04em',
              marginBottom: '28px',
              textTransform: 'uppercase',
              wordBreak: 'break-word',
            }}>
              {miembro.quote}
            </blockquote>

            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {miembro.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.15em',
                    color: '#1A1A1A',
                    border: '1px solid rgba(196,151,61,0.45)',
                    padding: '5px 10px',
                    textTransform: 'uppercase',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  )
}
