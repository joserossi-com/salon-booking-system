"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const WA = "https://wa.me/56985627686?text=%C2%A1Hola+Kitty+Studio!";
const IG = "https://www.instagram.com/kittystudio._/";

const links = [
  { href: "/#servicios", label: "Servicios" },
  { href: "/equipo",     label: "Equipo" },
  { href: "/precios",    label: "Precios" },
  { href: "/#galeria",   label: "Galería" },
  { href: "/#resenas",   label: "Reseñas" },
  { href: "/#contacto",  label: "Contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid rgba(166,124,42,0.15)",
        boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo — texto tipográfico en vez de imagen para evitar fondo blanco en el hero */}
        <a href="/" className="flex flex-col items-center shrink-0 leading-none" aria-label="Kitty Studio — inicio">
          <span className="font-heading text-[1.35rem] tracking-[0.18em] font-semibold" style={{ color: "#1A1A1A" }}>
            KITTY
          </span>
          <span className="relative w-full flex items-center gap-1.5 mt-0.5 mb-0.5">
            <span className="flex-1 h-px" style={{ backgroundColor: "#A67C2A" }} />
          </span>
          <span className="font-body text-[0.45rem] tracking-[0.35em] uppercase" style={{ color: "#1A1A1A" }}>
            Studio
          </span>
        </a>

        {/* Desktop center links */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="hover:text-[#A67C2A] tracking-[0.1em] text-[0.72rem] uppercase font-normal transition-colors duration-200"
                style={{ color: "#1A1A1A" }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop right CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={IG}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram de Kitty Studio"
            className="w-9 h-9 flex items-center justify-center transition-all duration-200 hover:bg-[#A67C2A]/10 group"
            style={{ border: "1px solid rgba(166,124,42,0.3)" }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 transition-colors duration-200" fill="#9A8C90" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
          <a
            href={WA}
            target="_blank"
            rel="noopener noreferrer"
            className="tracking-[0.15em] text-[0.7rem] uppercase px-5 py-2 transition-all duration-200"
            style={{
              backgroundColor: "#A67C2A",
              color: "#FFFFFF",
              fontWeight: 300,
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1A1A1A")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#A67C2A")}
          >
            Reservar hora
          </a>
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger>
            <span
              className="md:hidden p-2 flex items-center justify-center"
              role="button"
              aria-label="Abrir menú"
              tabIndex={0}
              style={{ color: "#1A1A1A" }}
            >
              <Menu size={22} />
            </span>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-72"
            style={{ backgroundColor: "#FFFFFF", borderLeft: "1px solid rgba(166,124,42,0.2)" }}
          >
            <div className="flex flex-col h-full pt-8 px-2">
              <div className="flex flex-col items-start mb-10">
                <span className="font-heading text-xl tracking-[0.18em] font-semibold" style={{ color: "#1A1A1A" }}>KITTY</span>
                <span className="w-12 h-px mt-0.5 mb-0.5" style={{ backgroundColor: "#A67C2A" }} />
                <span className="font-body text-[0.4rem] tracking-[0.35em] uppercase" style={{ color: "#1A1A1A" }}>Studio</span>
              </div>
              <ul className="flex flex-col gap-6">
                {links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="hover:text-[#A67C2A] tracking-[0.1em] text-[0.72rem] uppercase font-normal transition-colors"
                      style={{ color: "#1A1A1A" }}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pb-8 flex flex-col gap-3">
                <a
                  href={IG}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="block w-full text-center px-6 py-3 text-sm font-light border transition-colors"
                  style={{ borderColor: "rgba(166,124,42,0.4)", color: "#9A8C90" }}
                >
                  Instagram
                </a>
                <a
                  href={WA}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="block w-full text-center px-6 py-3 tracking-[0.15em] text-[0.7rem] uppercase font-light transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "#A67C2A", color: "#FFFFFF" }}
                >
                  Reservar por WhatsApp
                </a>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
