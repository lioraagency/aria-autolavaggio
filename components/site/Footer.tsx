import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-[rgba(255,255,255,0.06)] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <Link href="/" className="flex items-center">
            <span className="font-condensed font-black text-lg tracking-widest text-aria-text uppercase">
              AUTOLAVAGGIO
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-aria-accent ml-1 inline-block" />
          </Link>

          <nav className="flex flex-wrap gap-6">
            <a href="#services" className="text-aria-muted hover:text-aria-text text-sm font-condensed uppercase tracking-wider transition-colors">
              Services
            </a>
            <a href="#comment-ca-marche" className="text-aria-muted hover:text-aria-text text-sm font-condensed uppercase tracking-wider transition-colors">
              Comment ça marche
            </a>
            <a href="#avis" className="text-aria-muted hover:text-aria-text text-sm font-condensed uppercase tracking-wider transition-colors">
              Avis
            </a>
            <a href="#contact" className="text-aria-muted hover:text-aria-text text-sm font-condensed uppercase tracking-wider transition-colors">
              Contact
            </a>
            <Link href="/reservation" className="text-aria-accent font-condensed uppercase tracking-wider text-sm hover:underline transition-colors">
              Réserver
            </Link>
          </nav>
        </div>

        {/* Bottom row */}
        <div className="border-t border-[rgba(255,255,255,0.06)] pt-6 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <p className="text-aria-muted text-xs">
            © 2026 Autolavaggio. Tous droits réservés.
          </p>
          <p className="text-[11px] opacity-40 text-aria-muted">
            Propulsé par LIORA · liora.services
          </p>
          <Link
            href="/aria/login"
            className="text-[10px] opacity-30 text-aria-muted hover:opacity-60 transition-opacity"
          >
            Espace gestion
          </Link>
        </div>
      </div>
    </footer>
  );
}
