# Prompt para Claude Code — Kitty Studio: Recuperar y Perfeccionar el Diseño

---

## Contexto importante — lee esto primero

El sitio de Kitty Studio en `kittystudio.vercel.app` tenía un diseño muy avanzado que fue sobreescrito accidentalmente por un deployment incorrecto. El objetivo de este prompt es **recuperar y perfeccionar** ese diseño.

**ANTES DE TOCAR CUALQUIER ARCHIVO**: Lee las imágenes de referencia visual que están en `~/Desktop/reference/`. Usa la herramienta `Read` en cada imagen de esa carpeta para ver cómo debe quedar el sitio. Esas imágenes muestran el estado objetivo — cada sección, los colores, la tipografía y el layout que debes recuperar. Si hay alguna diferencia entre lo que describes abajo y lo que ves en las imágenes, **las imágenes tienen prioridad**.

Lee este prompt completo antes de modificar cualquier archivo. Cuando termines cada tarea, verifica visualmente que coincide con la descripción.

---

## Stack técnico

- **Next.js 14** con App Router (`src/app/`)
- **Tailwind CSS** + estilos inline
- **Framer Motion** para animaciones
- **Supabase** (no tocar)
- **Fuentes**: Cormorant Garamond (headings/títulos) + Montserrat (body/labels/botones)

---

## Sistema de color — aplicar en TODO el sitio

| Nombre | Hex | Uso |
|---|---|---|
| Blush | `#F5EFF0` | Fondo de secciones claras (Navbar, Servicios, Galería header, Nosotros, Equipo, Reseñas) |
| Blanco | `#FFFFFF` | Tarjetas (Servicios, Reseñas) |
| Oro primario | `#C4973D` | Acentos, labels, iconos, separadores, estrellas, precios, bordes activos |
| Oro oscuro | `#A67C2A` | Hover de elementos dorados |
| Texto principal | `#1A1414` | Textos sobre fondos claros |
| Fondo oscuro (secciones) | `#1A1414` | Hero, CTA "Agenda con la especialista", sección Contacto |
| Footer | `#120D0D` | Solo el footer (más oscuro que el resto) |

**Nunca uses** colores morados, azules Tailwind, ni rosas brillantes. No uses `backdrop-filter` en el navbar (causa que se vea blanco).

---

## Fuentes — verificar en `src/app/layout.tsx`

Confirma que `Cormorant_Garamond` y `Montserrat` estén importadas y sus variables CSS definidas:

```tsx
import { Cormorant_Garamond, Montserrat } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
})
```

Aplica `${cormorant.variable} ${montserrat.variable}` en el `<body>`.

---

## TAREA 1 — Fix urgente: marcos de color en imágenes de la Galería (y carruseles)

**Problema**: En la sección Galería, las fotos muestran un fondo rosa/blush `#F5EFF0` o colores de fondo que "sangran" alrededor de la imagen, creando un marco de color indeseado. Lo mismo puede ocurrir en el carrusel de Nosotros.

**Causa**: El contenedor de la imagen tiene un `background-color` visible, o la imagen no ocupa el 100% del contenedor, o le falta `overflow: hidden`.

**Fix universal** — aplicar a TODOS los contenedores de imagen del sitio:

```css
/* Contenedor */
overflow: hidden;
background: transparent; /* o eliminar background-color */
padding: 0;
border: none; /* a menos que sea un borde decorativo intencional */

/* Imagen dentro */
width: 100%;
height: 100%;
object-fit: cover;
object-position: center;
display: block;
```

En Next.js con `<Image>`:
```tsx
<div style={{ overflow: 'hidden', position: 'relative', width: '100%', height: '300px' }}>
  <Image
    src={src}
    alt={alt}
    fill
    style={{ objectFit: 'cover', objectPosition: 'center' }}
  />
</div>
```

**Archivos a revisar**:
- `src/components/Galeria.tsx` — cada slide/card del carrusel categorizado
- `src/components/Nosotros.tsx` — carrusel fade lateral
- `src/components/Hero.tsx` — collage/halo de imágenes de fondo
- `src/components/ImageFallback.tsx` — actualiza el gradiente fallback a: `background: linear-gradient(135deg, #C4973D 0%, #D4B96A 100%)`

---

## TAREA 2 — Navbar

El navbar debe tener fondo sólido blush, sin transparencia ni blur:

```tsx
style={{
  backgroundColor: "#F5EFF0",
  borderBottom: "1px solid rgba(166,124,42,0.18)",
  boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.06)" : "none",
  // NO backdrop-filter
}}
```

**Logo**: En el navbar debe ir el logo con fondo claro. Si existe `/public/images/logo.png` (versión clara/rosa), úsalo. Si no existe o solo existe el logo negro (`/public/images/kitty_logo_negro.png`), muéstralo tal cual — el fondo blush hace que se vea bien.

Links: color `#1A1414`, hover `#C4973D`. Sin underline.

---

## TAREA 3 — Hero (sección principal)

- Fondo: `#1A1414` como base, con el collage/halo de imágenes superpuesto con overlay oscuro
- El collage debe tener `overflow: hidden` en cada celda, imágenes con `object-fit: cover`
- "KITTY" y "STUDIO" en Cormorant Garamond, blanco `#FFFFFF`, peso light/300
- Subtítulo: Montserrat, `rgba(255,255,255,0.75)`, peso light
- Etiquetas superiores ("VIÑA DEL MAR · BELLEZA & MODA"): Montserrat uppercase, `#C4973D`, letra-spacing amplio
- Botón 1 "VER SERVICIOS": fondo `#1A1414` o gris muy oscuro, texto blanco, borde `rgba(255,255,255,0.3)`
- Botón 2 "RESERVAR HORA": fondo `#C4973D`, texto blanco, sin borde extra

---

## TAREA 4 — Servicios

Descripción visual de referencia: fondo blush `#F5EFF0`, label "LO QUE HACEMOS" en oro, título "SERVICIOS" en Cormorant Garamond grande. Grilla de 2 columnas (mobile) / 4 columnas (desktop) con tarjetas blancas.

Cada tarjeta:
- Fondo: `#FFFFFF`
- Bordes decorativos en las esquinas (esquinas estilo bracket `⌐` `¬`): color `#C4973D`, opacidad baja
- Círculo con icono arriba: fondo `rgba(245,239,240,1)` (blush), icono en `#C4973D`
- Nombre del servicio: Cormorant Garamond, uppercase, `#1A1414`, tamaño grande
- Descripción: Montserrat, `#1A1414` al 70%
- Precio "Desde $X.000": Montserrat, color `#C4973D`

Botones al final de la sección:
- "VER LISTA DE PRECIOS COMPLETA": outline, borde `#1A1414`, texto `#1A1414`
- "RESERVAR HORA": fondo `#C4973D`, texto blanco

---

## TAREA 5 — Galería

Descripción visual: fondo blush `#F5EFF0`, label "NUESTRO TRABAJO" en oro, título "GALERÍA" en Cormorant Garamond. Filtros como pills/chips:

- Filtro inactivo: borde `rgba(196,151,61,0.4)`, texto `#1A1414`, fondo transparente, `border-radius: 9999px`
- Filtro activo: fondo `#C4973D`, texto `#FFFFFF`

Imágenes del carrusel: **aplicar fix de Tarea 1** para eliminar el fondo blush/rosa que sangra alrededor.

Al final: link "@kittystudio._" en texto `#C4973D`.

---

## TAREA 6 — Nosotros

Layout: texto a la izquierda (o arriba en mobile), carrusel de imagen a la derecha.

- Fondo: `#F5EFF0`
- Label "SOBRE NOSOTRAS": Montserrat uppercase, `#C4973D`
- Título "BELLEZA CON DETALLE": Cormorant Garamond, `#1A1414`, peso light, tamaño muy grande
- Cuerpo: Montserrat, `#1A1414`
- Botón "AGENDA TU HORA": fondo `#C4973D`, texto blanco
- Imagen/carrusel de cabello: full-width, `object-fit: cover`, sin marcos — **aplicar fix Tarea 1**

---

## TAREA 7 — Sección Equipo (recuperar diseño editorial)

Esta sección ya existía con un diseño editorial vertical elegante. **Recuperar exactamente** este layout:

### Header de la sección:

```
[diamante dorado ♦]  NUESTRO EQUIPO          ← Montserrat uppercase, oro, pequeño
CONOCE AL                                     ← Cormorant Garamond, grande, #1A1414
EQUIPO                                        ← (mismo estilo)
───────                                       ← línea decorativa dorada, centrada, ~48px
TRES ESPECIALISTAS · UN MISMO COMPROMISO      ← Montserrat uppercase, pequeño, #1A1414 al 50%
```

Fondo del header: `#F5EFF0`

### Layout de cada integrante (mobile-first, vertical):

```
┌─────────────────────────────────┐
│  [foto o placeholder circular]  │  ← círculo grande centrado, o imagen cuadrada
│      foto próximamente          │  ← italic, gris suave (solo si no hay foto)
├─────────────────────────────────┤
│  01 / 03  ──────  FUNDADORA     │  ← Montserrat, pequeño, oro/gris
│                                 │
│  KITTY                          │  ← Cormorant Garamond, 4-5rem, #1A1414
│                                 │
│  FUNDADORA · PESTAÑAS · CEJAS   │  ← Montserrat uppercase, pequeño, #C4973D
│  · FACIAL · MICROPIGMENTACIÓN  │
│                                 │
│  ──────  PASIÓN & ESPECIALIDAD  │  ← línea dorada + label Montserrat uppercase gris
│                                 │
│  "FUNDÉ KITTY STUDIO PORQUE     │  ← Cormorant Garamond italic, uppercase, grande
│   CREO QUE CADA MUJER MERECE    │    color #1A1414, leading amplio
│   SENTIRSE INCREÍBLE..."        │
│                                 │
│  [EXTENSIONES PESTAÑAS] [LIFT.] │  ← tags/badges: borde #C4973D, texto #1A1414
│  [DISEÑO DE CEJAS] [LAMINADO]   │    Montserrat uppercase, muy pequeño
└─────────────────────────────────┘
```

En desktop (>768px): el layout puede expandirse a 2 columnas (foto izq + contenido der, o viceversa alternando).

### Placeholder cuando no hay foto:

```tsx
<div style={{
  width: '180px',
  height: '180px',
  borderRadius: '50%',
  border: '1px solid #C4973D',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#F5EFF0',
}}>
  <span style={{
    fontFamily: 'var(--font-heading)',
    fontSize: '4rem',
    color: '#C4973D',
    fontWeight: 300,
  }}>K</span>  {/* o N o C según el integrante */}
</div>
<p style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', color: '#999', marginTop: '12px', fontSize: '0.9rem' }}>
  foto próximamente
</p>
```

### Cuando SÍ haya foto, el contenedor debe tener:

```tsx
<div style={{ overflow: 'hidden', borderRadius: '4px', width: '100%', aspectRatio: '3/4' }}>
  <Image src={foto} alt={nombre} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
</div>
```

### Datos del equipo:

```ts
const equipo = [
  {
    numero: "01",
    nombre: "KITTY",
    cargo: "FUNDADORA",
    especialidades: "FUNDADORA · PESTAÑAS · CEJAS · FACIAL · MICROPIGMENTACIÓN",
    quote: "\"FUNDÉ KITTY STUDIO PORQUE CREO QUE CADA MUJER MERECE SENTIRSE INCREÍBLE. ME ESPECIALIZO EN RESALTAR LA BELLEZA NATURAL, CON TÉCNICAS DE PRECISIÓN Y MUCHO CARIÑO.\"",
    tags: ["EXTENSIONES PESTAÑAS", "LIFTING PESTAÑAS", "DISEÑO DE CEJAS", "LAMINADO CEJAS", "MICROPIGMENTACIÓN", "FACIAL", "EXTENSIONES CABELLO"],
    foto: "/images/equipo/kitty.jpg",
    inicial: "K",
  },
  {
    numero: "02",
    nombre: "NICOLE",
    cargo: "NAIL ART & DEPILACIÓN",
    especialidades: "NAIL ART & DEPILACIÓN",
    quote: "\"EL NAIL ART ES UNA FORMA DE ARTE QUE LLEVO EN LAS MANOS. ME ENCANTA CREAR DISEÑOS QUE EXPRESEN LA PERSONALIDAD DE CADA CLIENTA, DESDE LO MÁS DELICADO HASTA LO MÁS AUDAZ.\"",
    tags: ["UÑAS ACRÍLICAS", "POLYGEL", "SOFT GEL", "KAPPING", "NAIL ART", "PEDICURA"],
    foto: "/images/equipo/nicole.jpg",
    inicial: "N",
  },
  {
    numero: "03",
    nombre: "CONSTANZA",
    cargo: "CABELLO & MASAJES",
    especialidades: "CABELLO & MASAJES",
    quote: "\"EL CABELLO ES MI LIENZO Y CADA CLIENTA TRAE UNA HISTORIA DISTINTA. TRABAJO PARA QUE SALGAS RENOVADA, CON UN ESTILO QUE TE REPRESENTE.\"",
    tags: ["CORTE Y COLOR", "TRATAMIENTOS", "EXTENSIONES", "MASAJE RELAJANTE", "MASAJE DEPORTIVO"],
    foto: "/images/equipo/constanza.jpg",
    inicial: "C",
  },
]
```

Fondo alternado entre integrantes: blush `#F5EFF0` y blanco `#FFFFFF`, para dar separación visual.

---

## TAREA 8 — CTA "Agenda con la especialista"

Sección oscura entre Equipo y Reseñas:

- Fondo: `#1A1414`
- Diamond accent: `♦` en `#C4973D`
- Label: "¿LISTA PARA TU MOMENTO?" — Montserrat uppercase, `#C4973D`, pequeño
- Título: "AGENDA CON LA ESPECIALISTA QUE NECESITAS" — Cormorant Garamond, blanco, grande, centrado
- Botón "AGENDAR POR WHATSAPP": borde `1px solid #C4973D`, texto `#C4973D`, fondo transparente, hover: fondo `#C4973D`, texto blanco

---

## TAREA 9 — Reseñas

- Fondo sección: `#F5EFF0`
- Label "LO QUE DICEN NUESTRAS CLIENTAS": Montserrat uppercase, `#C4973D`
- Título "RESEÑAS": Cormorant Garamond, `#1A1414`, grande
- Rating "★★★★★ 5.0 Google": estrellas `#C4973D`, texto Montserrat

Cada tarjeta de reseña:
- Fondo: `#FFFFFF`
- Estrellas: `#C4973D`
- Texto reseña: Cormorant Garamond italic, `#1A1414`
- Avatar inicial: círculo `#F5EFF0`, letra `#C4973D`
- Nombre: Montserrat uppercase, `#1A1414`
- Servicio: Montserrat, `#1A1414` al 55%

---

## TAREA 10 — Contacto (sección oscura con mapa)

Mapa de Google Maps embed (ya existe, solo verificar que se muestre correctamente).

Sección oscura debajo del mapa:
- Fondo: `#1A1414`
- Label "ENCUÉNTRANOS": Montserrat uppercase, `#C4973D`
- Título grande "¿LISTA PARA TU MOMENTO?": Cormorant Garamond, blanco
- Botón WhatsApp: borde `#C4973D`, texto `#C4973D` con ícono
- Info (dirección, horario): icono `#C4973D`, texto blanco al 70%

---

## TAREA 11 — Footer

- Fondo: `#120D0D` (muy oscuro, casi negro)
- Logo: usar `/public/images/kitty_logo_negro.png` con `filter: brightness(0) invert(1)` para que se vea blanco sobre el fondo oscuro
- Descripción: Montserrat, `rgba(255,255,255,0.55)`
- Secciones CONTACTO / MENÚ / SÍGUENOS: labels en Montserrat uppercase, `#C4973D`
- Links del menú: Inicio, Servicios, Equipo, Precios, Galería, Contacto — texto `rgba(255,255,255,0.7)`, hover `#C4973D`
- Íconos sociales (Instagram, WhatsApp): círculos `rgba(255,255,255,0.1)`, ícono blanco
- Copyright: Montserrat muy pequeño, `rgba(255,255,255,0.35)`

---

## TAREA 12 — WhatsApp Float Button

- Color del botón: `#C4973D` (NO el verde estándar de WhatsApp)
- Ícono WhatsApp: blanco
- `border-radius: 50%`
- `box-shadow: 0 4px 16px rgba(196,151,61,0.4)`

---

## Orden de ejecución

1. Fix fuentes en `layout.tsx`
2. Fix `ImageFallback.tsx` (gradiente dorado)
3. **Fix imágenes** en Galeria + Nosotros + Hero (Tarea 1) — esto es lo más urgente
4. Navbar (Tarea 2)
5. Hero (Tarea 3)
6. Servicios (Tarea 4)
7. Galería (Tarea 5)
8. Nosotros (Tarea 6)
9. Equipo (Tarea 7) — recuperar el layout editorial vertical
10. CTA (Tarea 8)
11. Reseñas (Tarea 9)
12. Contacto (Tarea 10)
13. Footer (Tarea 11)
14. WhatsApp Float (Tarea 12)
15. `npm run build` — corregir todos los errores de TypeScript/build que aparezcan
16. Si build OK: `git add -A && git commit -m "feat: recover and perfect gold/blush design system" && vercel --prod`

---

## Restricciones absolutas

- **NO uses `backdrop-filter`** en el navbar
- **NO uses colores morados, azules Tailwind, ni rosas brillantes**
- **NO toques** Supabase, API routes, ni archivos de autenticación
- **NO cambies** la estructura de rutas (las páginas que existen se mantienen)
- Si una imagen de equipo no existe en `/public/images/equipo/`, usa el placeholder con inicial — no generes imágenes
- Mantén todas las animaciones Framer Motion existentes, solo ajusta colores
- El sitio debe ser completamente **responsive** — mobile first

---

*Prompt generado para Kitty Studio · kittystudio.vercel.app*
