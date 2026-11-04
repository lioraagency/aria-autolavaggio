"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Barre « Réserver » mobile (< 768 px) : visible dès que le bouton « Réserver » du héros
// sort de l'écran. Placée sous le menu mobile (z-40 < z-50 de la nav).
export default function MobileBookingBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.querySelector("[data-hero-cta]");
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting));
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[rgba(255,255,255,0.06)] bg-aria-bg/90 backdrop-blur-md pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] transition-transform duration-[250ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
        visible ? "translate-y-0" : "translate-y-full pointer-events-none"
      }`}
    >
      <Link
        href="/reservation"
        tabIndex={visible ? 0 : -1}
        className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-aria-accent text-[#0A0A0A] font-condensed font-black uppercase text-lg tracking-wider active:scale-[0.97] transition-transform duration-[120ms]"
      >
        Réserver maintenant
      </Link>
    </div>
  );
}
