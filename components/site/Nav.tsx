"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Services", href: "#services" },
    { label: "Comment ça marche", href: "#comment-ca-marche" },
    { label: "Avis", href: "#avis" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-28 transition-all duration-300 ${
        scrolled
          ? "bg-aria-bg/95 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img
            src="/logo-autolavaggio.png"
            alt="Autolavaggio"
            style={{height:'56px',width:'auto'}}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-white hover:text-aria-accent text-sm font-condensed uppercase tracking-widest transition-colors duration-200 hover:drop-shadow-[0_0_8px_rgba(213,252,150,0.6)]"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/reservation"
            className="bg-aria-accent text-[#0A0A0A] font-condensed font-black uppercase tracking-wider px-4 py-2 rounded-lg text-sm hover:scale-105 transition-transform"
          >
            Réserver
          </Link>
        </nav>

        {/* Mobile: hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          <span
            className={`block w-6 h-0.5 bg-aria-text transition-transform duration-200 ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-aria-text transition-opacity duration-200 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-aria-text transition-transform duration-200 ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-aria-bg/95 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)] px-6 pb-6 pt-2 animate-slide-down">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-aria-muted hover:text-aria-text text-sm font-condensed uppercase tracking-wider transition-colors py-1"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/reservation"
              onClick={() => setMenuOpen(false)}
              className="bg-aria-accent text-[#0A0A0A] font-condensed font-black uppercase tracking-wider px-4 py-3 rounded-lg text-sm text-center hover:scale-105 transition-transform mt-2"
            >
              Réserver
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
