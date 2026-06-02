"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const services = [
  {
    name: "Extérieur Seul",
    price: "65$",
    priceTax: "avant taxes",
    duration: "45 min",
    priceSub: null,
    features: [
      "Lavage carrosserie à la main",
      "Nettoyage roues & pneus",
      "Séchage microfibre",
    ],
    recommended: false,
  },
  {
    name: "Intérieur Seul",
    price: "70$",
    priceTax: "avant taxes",
    duration: "60 min",
    priceSub: "+15$ pour VUS",
    features: [
      "Aspiration complète",
      "Plastiques, sièges, tapis",
      "Vitres intérieures",
    ],
    recommended: false,
  },
  {
    name: "Service Complet",
    price: "99$",
    priceTax: "avant taxes",
    duration: "90 min",
    priceSub: "+20$ pour VUS",
    features: [
      "Tout l'extérieur + intérieur",
      "Finition détaillée",
    ],
    recommended: true,
  },
];

const supplements = [
  "Traitement calcium : +20$",
  "Shampoing moteur : +35$",
  "Demandes spéciales sur mesure",
];

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="py-24 bg-aria-surface opacity-0 translate-y-8 transition-all duration-700 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <h2 className="font-condensed font-black uppercase tracking-tight text-5xl md:text-6xl text-aria-text mb-16">
          Nos Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.name}
              className="relative bg-aria-bg border border-[rgba(255,255,255,0.06)] rounded-2xl p-8 hover:border-aria-accent/40 hover:-translate-y-1 transition-all duration-200"
            >
              {service.recommended && (
                <span className="absolute top-4 right-4 bg-aria-accent text-[#0A0A0A] font-condensed font-black text-xs uppercase tracking-wider px-3 py-1 rounded-full">
                  Recommandé
                </span>
              )}

              <span className="text-aria-muted text-xs font-condensed uppercase tracking-wider">
                {service.duration}
              </span>

              <h3 className="font-condensed font-black text-2xl uppercase text-aria-text mt-1">
                {service.name}
              </h3>

              <div className="mt-2">
                <span className="text-aria-accent font-condensed font-black text-4xl">
                  {service.price}
                </span>
                {service.priceSub && (
                  <span className="text-aria-muted text-sm ml-2 font-sans">
                    {service.priceSub}
                  </span>
                )}
                {service.priceTax && (
                  <span className="text-aria-muted text-xs font-sans block mt-0.5">
                    {service.priceTax}
                  </span>
                )}
              </div>

              <ul className="mt-4 space-y-1">
                {service.features.map((feat) => (
                  <li key={feat} className="text-aria-muted text-sm font-sans leading-loose flex gap-2">
                    <span className="text-aria-accent select-none">·</span>
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                href="/reservation"
                className="inline-block text-aria-accent text-sm font-condensed uppercase tracking-wider mt-6 hover:underline"
              >
                Réserver ce service →
              </Link>
            </div>
          ))}
        </div>

        {/* Supplements */}
        <div className="flex flex-wrap gap-3 mt-10">
          {supplements.map((s) => (
            <span
              key={s}
              className="bg-aria-accent/10 border border-aria-accent/40 rounded-full px-4 py-2 text-sm text-aria-accent font-condensed uppercase"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
