import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-[rgba(255,255,255,0.06)] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <Link href="/" className="flex items-center">
            <img src="/logo-autolavaggio.png" alt="Autolavaggio" style={{height:'32px',width:'auto'}} />
          </Link>

          <nav className="flex flex-wrap gap-6">
            <a href="#services" className="text-aria-text text-sm font-sans hover:text-aria-accent transition-colors">
              Services
            </a>
            <a href="#comment-ca-marche" className="text-aria-text text-sm font-sans hover:text-aria-accent transition-colors">
              Comment ça marche
            </a>
            <a href="#avis" className="text-aria-text text-sm font-sans hover:text-aria-accent transition-colors">
              Avis
            </a>
            <a href="#contact" className="text-aria-text text-sm font-sans hover:text-aria-accent transition-colors">
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
          <a href="https://liora.services" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 opacity-40 hover:opacity-60 transition-opacity">
            <span className="text-[11px] text-aria-muted">Propulsé par</span>
            <img src="/logo-liora.png" alt="LIORA" style={{height:'16px',width:'auto'}} />
          </a>
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
