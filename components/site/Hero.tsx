"use client";

import Image from "next/image";
import Link from "next/link";

const stats = [
  { value: "2000+", label: "Véhicules lavés" },
  { value: "4.9 ★", label: "Satisfaction" },
  { value: "100%", label: "Manuel · à la main" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-car-black.jpg"
          alt="Porsche GT4 — Autolavaggio"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0A0A0A]/45" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-12 max-w-5xl mx-auto w-full pt-24 pb-32">
        <p
          className="text-aria-muted text-sm font-condensed uppercase tracking-widest mb-4 animate-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          Lavage à la main · Sans rendez-vous · Sainte-Foy
        </p>

        <h1
          className="font-condensed font-black text-[clamp(3.5rem,9vw,7rem)] uppercase leading-none tracking-tight text-aria-text animate-fade-up"
          style={{ animationDelay: "100ms" }}
        >
          Propre.
          <br />
          Rapide.
          <br />
          Pratique.
        </h1>

        <p
          className="text-aria-muted text-lg font-sans font-light max-w-xl mt-6 animate-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          Votre voiture mérite mieux qu&apos;une machine. Lavage manuel professionnel,
          réservation en ligne en 60 secondes.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 mt-8 animate-fade-up"
          style={{ animationDelay: "300ms" }}
        >
          <Link
            href="/reservation"
            className="bg-aria-accent text-[#0A0A0A] px-8 py-4 font-condensed font-black uppercase tracking-wider rounded-lg hover:scale-105 transition-transform text-base text-center"
          >
            Réserver →
          </Link>
          <a
            href="#services"
            className="border border-[rgba(255,255,255,0.2)] text-aria-text px-8 py-4 font-condensed uppercase tracking-wider rounded-lg hover:border-aria-accent transition-colors text-base text-center"
          >
            Voir les services
          </a>
        </div>
      </div>

      {/* Stats bar */}
      <div className="relative z-10 border-t border-[rgba(255,255,255,0.06)] bg-[#0A0A0A]/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-3 md:grid-cols-3 divide-x divide-[rgba(255,255,255,0.06)]">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center py-6 px-4 gap-1"
              >
                <span className="text-aria-accent font-condensed font-black text-2xl leading-none">
                  {stat.value}
                </span>
                <span className="text-aria-muted text-xs uppercase tracking-wider text-center font-condensed">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
