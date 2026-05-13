"use client";

const hours = [
  { days: "Lundi", time: "9h – 17h" },
  { days: "Mardi", time: "9h – 17h" },
  { days: "Mercredi", time: "9h – 21h" },
  { days: "Jeudi", time: "9h – 21h" },
  { days: "Vendredi", time: "9h – 17h" },
  { days: "Samedi & Dimanche", time: "Fermé" },
];

export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-aria-surface">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <h2 className="font-condensed font-black uppercase tracking-tight text-5xl md:text-6xl text-aria-text mb-16">
          Nous trouver
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left: info */}
          <div className="flex flex-col gap-10">
            {/* Adresse */}
            <div>
              <h3 className="font-condensed font-black uppercase tracking-wider text-xs text-aria-muted mb-2">
                Adresse
              </h3>
              <p className="font-condensed font-black text-xl text-aria-text uppercase">
                2125 chemin Ste-Foy, Québec
              </p>
              <p className="text-aria-muted text-sm font-sans mt-1">
                Stationnement Shell (angle Myrand)
              </p>
            </div>

            {/* Horaires */}
            <div>
              <h3 className="font-condensed font-black uppercase tracking-wider text-xs text-aria-muted mb-3">
                Horaires
              </h3>
              <div className="flex flex-col gap-1.5">
                {hours.map((h) => (
                  <div key={h.days} className="flex justify-between items-center">
                    <span className="text-aria-muted text-sm font-sans">{h.days}</span>
                    <span
                      className={`text-sm font-condensed font-bold uppercase tracking-wide ${
                        h.time === "Fermé" ? "text-aria-muted" : "text-aria-text"
                      }`}
                    >
                      {h.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <h3 className="font-condensed font-black uppercase tracking-wider text-xs text-aria-muted mb-2">
                Téléphone
              </h3>
              <a
                href="tel:5817053005"
                className="text-aria-accent font-condensed font-black text-2xl hover:underline"
              >
                581-705-3005
              </a>
            </div>
          </div>

          {/* Right: map */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.06)]">
              <iframe
                src="https://maps.google.com/maps?q=2125+chemin+Sainte-Foy+Quebec&output=embed"
                width="100%"
                height="350"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                title="Autolavaggio — 2125 chemin Ste-Foy"
              />
            </div>
            <a
              href="https://maps.google.com/?q=2125+chemin+Sainte-Foy+Quebec"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-aria-accent text-aria-accent font-condensed font-black uppercase tracking-wider px-6 py-3 rounded-lg text-sm hover:bg-aria-accent hover:text-[#0A0A0A] transition-colors text-center"
            >
              Obtenir l&apos;itinéraire →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
