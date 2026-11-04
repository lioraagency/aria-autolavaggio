import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-[rgba(255,255,255,0.06)] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <Link href="/" aria-label="Autolavaggio — accueil" className="relative after:absolute after:content-[''] after:-inset-y-1.5 flex items-center">
            <Image src="/logo-autolavaggio.png" alt="Autolavaggio" width={170} height={32} />
          </Link>

          <nav className="flex flex-wrap gap-6">
            <a href="#services" className="relative after:absolute after:content-[''] after:-inset-y-3 after:-inset-x-2.5 text-aria-text text-sm font-sans hover:text-aria-accent transition-colors">
              Services
            </a>
            <a href="#comment-ca-marche" className="relative after:absolute after:content-[''] after:-inset-y-3 after:-inset-x-2.5 text-aria-text text-sm font-sans hover:text-aria-accent transition-colors">
              Comment ça marche
            </a>
            <a href="#avis" className="relative after:absolute after:content-[''] after:-inset-y-3 after:-inset-x-2.5 text-aria-text text-sm font-sans hover:text-aria-accent transition-colors">
              Avis
            </a>
            <a href="#contact" className="relative after:absolute after:content-[''] after:-inset-y-3 after:-inset-x-2.5 text-aria-text text-sm font-sans hover:text-aria-accent transition-colors">
              Contact
            </a>
            <Link href="/reservation" className="relative after:absolute after:content-[''] after:-inset-y-3 text-aria-accent font-condensed uppercase tracking-wider text-sm hover:underline transition-colors">
              Réserver
            </Link>
          </nav>
        </div>

        {/* Bottom row */}
        <div className="border-t border-[rgba(255,255,255,0.06)] pt-6 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <p className="text-aria-muted text-xs">
            © 2026 Autolavaggio. Tous droits réservés.
          </p>
          <a href="https://liora.services" target="_blank" rel="noopener noreferrer" className="relative after:absolute after:content-[''] after:-inset-y-[14px] flex items-center gap-1.5 opacity-40 hover:opacity-60 transition-opacity">
            <span className="text-[11px] text-aria-muted">Propulsé par</span>
            <Image src="/logo-liora.png" alt="LIORA" width={36} height={16} />
          </a>
          <div className="flex items-center gap-3">
            <Link
              href="/aria/login"
              className="relative after:absolute after:content-[''] after:-inset-y-[15px] text-[10px] opacity-30 text-aria-muted hover:opacity-60 transition-opacity"
            >
              Espace gestion
            </Link>
            <Link
              href="/aria/dispo"
              className="relative after:absolute after:content-[''] after:-inset-y-[15px] text-[10px] opacity-30 text-aria-muted hover:opacity-60 transition-opacity"
            >
              Disponibilités
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
