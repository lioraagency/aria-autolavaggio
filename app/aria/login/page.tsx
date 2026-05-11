import type { Metadata } from "next";
import PinPad from "@/components/PinPad";

export const metadata: Metadata = {
  title: "ARIA — Connexion",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-aria-bg flex flex-col items-center justify-between px-6 pt-safe">

      {/* Top — Logo */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 w-full">
        <div className="text-center mb-8">
          <h1 className="font-condensed font-black text-[5rem] uppercase tracking-[0.05em] text-aria-text leading-none">
            ARIA
          </h1>
          <p className="font-condensed text-aria-muted text-sm uppercase tracking-[0.15em] mt-2">
            Cockpit Autolavaggio
          </p>
        </div>

        <PinPad />
      </div>

      {/* Footer */}
      <footer className="py-6 pb-safe text-center">
        <p className="text-aria-muted text-[11px] font-condensed uppercase tracking-[0.12em]">
          by LIORA
        </p>
      </footer>
    </div>
  );
}
