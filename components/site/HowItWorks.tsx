"use client";

import { useEffect, useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Réservez en ligne",
    description: "En 60 secondes via notre formulaire en ligne. Choisissez votre service, votre créneau.",
  },
  {
    number: "02",
    title: "Arrivez à l'heure",
    description: "Rendez-vous au 2125 chemin Ste-Foy (stationnement Shell). Facile d'accès.",
  },
  {
    number: "03",
    title: "On s'occupe de tout",
    description: "Nos techniciens prennent soin de votre véhicule. Comptez 45 à 90 minutes.",
  },
  {
    number: "04",
    title: "Repartez impeccable",
    description: "Votre voiture est propre comme au premier jour. Satisfaction garantie.",
  },
];

export default function HowItWorks() {
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
      id="comment-ca-marche"
      ref={sectionRef}
      className="py-24 bg-aria-bg opacity-0 translate-y-8 transition-all duration-700 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <h2 className="font-condensed font-black uppercase tracking-tight text-5xl md:text-6xl text-aria-text mb-16">
          Comment ça marche
        </h2>

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-0">
          {steps.map((step, i) => (
            <div key={step.number} className="relative flex flex-col md:items-center md:text-center md:px-6">
              {/* Connector line (desktop only, between steps) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-px border-t border-[rgba(255,255,255,0.06)]" />
              )}

              <div className="relative z-10">
                <span className="font-condensed font-black text-6xl text-aria-accent/20 leading-none block">
                  {step.number}
                </span>
                <h3 className="font-condensed font-black text-xl uppercase text-aria-text mt-2">
                  {step.title}
                </h3>
                <p className="text-aria-muted text-sm font-sans mt-2 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
