"use client";

import { useEffect, useRef } from "react";

const testimonials = [
  {
    author: "Martin T.",
    service: "Service Complet",
    quote: "Mon VUS avait l'air neuf en sortant. Service impeccable.",
  },
  {
    author: "Sarah G.",
    service: "Service Complet",
    quote: "45 minutes et ma voiture était impeccable. Je reviendrai.",
  },
  {
    author: "François R.",
    service: "Extérieur",
    quote:
      "Les machines automatiques manquent toujours des endroits — ici, rien n'est oublié.",
  },
];

export default function Testimonials() {
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
      id="avis"
      ref={sectionRef}
      className="py-24 bg-aria-surface opacity-0 translate-y-8 transition-all duration-700 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <h2 className="font-condensed font-black uppercase tracking-tight text-5xl md:text-6xl text-aria-text mb-16">
          Ce qu&apos;ils disent
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="bg-aria-bg border border-[rgba(255,255,255,0.06)] rounded-2xl p-6"
            >
              <div className="text-aria-accent text-sm tracking-widest">★★★★★</div>

              <p className="text-aria-text font-sans italic text-base leading-relaxed mt-3">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="border-t border-[rgba(255,255,255,0.06)] mt-4 pt-4">
                <span className="text-aria-text font-condensed font-bold text-sm uppercase block">
                  {t.author}
                </span>
                <span className="text-aria-muted text-xs font-condensed">{t.service}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
