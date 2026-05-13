"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

const images = [
  { src: "/images/691ca55ab55a5957c6387079.webp", alt: "Intérieur lavage auto" },
  { src: "/images/6899cce61636d2d2a897d733.webp", alt: "Extérieur lavage auto" },
  { src: "/images/68fd2733295ec04b856700ae.webp", alt: "Véhicule propre" },
  { src: "/images/68fd27f7f3d5b246c80c1256.webp", alt: "Détail carrosserie" },
  { src: "/images/691ca4f66a5d3b6d0899309a.webp", alt: "Service de lavage" },
  { src: "/images/photo-1471623432079-b009d30b6729.webp", alt: "Voiture propre" },
];

export default function Gallery() {
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
      id="galerie"
      ref={sectionRef}
      className="py-24 bg-aria-bg opacity-0 translate-y-8 transition-all duration-700 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <h2 className="font-condensed font-black uppercase tracking-tight text-5xl md:text-6xl text-aria-text mb-16">
          Galerie
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img) => (
            <div
              key={img.src}
              className="rounded-xl overflow-hidden aspect-square relative hover:scale-105 transition-transform duration-300 cursor-pointer border-2 border-transparent hover:border-aria-accent/50"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
