import type { NextConfig } from "next";

const securityHeaders = [
  // Evita que el navegador adivine el tipo MIME (MIME sniffing)
  { key: "X-Content-Type-Options",    value: "nosniff" },
  // Bloquea clickjacking — nadie puede embeber el sitio en un iframe
  { key: "X-Frame-Options",           value: "DENY" },
  // Fuerza HTTPS por 1 año, incluye subdominios
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Controla cuánta info de referrer se envía a otros sitios
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  // Bloquea features del navegador que no necesita este sitio
  {
    key:   "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Content Security Policy — limita de dónde se puede cargar contenido
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: solo propios + inline para Next.js (nonces en producción idealmente)
      "script-src 'self' 'unsafe-inline'",
      // Estilos: propios + inline (Tailwind los genera inline)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fuentes
      "font-src 'self' https://fonts.gstatic.com",
      // Imágenes: propios + CDN de Instagram + Supabase Storage
      "img-src 'self' data: https://*.cdninstagram.com https://www.bon-bon.com https://*.supabase.co",
      // Conexiones API: propios + Supabase + Upstash + Anthropic
      "connect-src 'self' https://*.supabase.co https://*.upstash.io https://api.anthropic.com https://api.telegram.org",
      // No permite embeber frames de terceros
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Silencia el warning de múltiples lockfiles
  turbopack: {
    root: __dirname,
  },

  headers: async () => [
    {
      // Aplica a todas las rutas
      source: "/(.*)",
      headers: securityHeaders,
    },
    {
      // Las API routes no necesitan X-Frame-Options ni CSP tan estricto
      // pero sí necesitan evitar que se cacheen respuestas sensibles
      source: "/api/(.*)",
      headers: [
        { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        { key: "X-Content-Type-Options", value: "nosniff" },
      ],
    },
  ],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.bon-bon.com",
      },
      {
        protocol: "https",
        hostname: "scontent.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
    ],
  },
};

export default nextConfig;
