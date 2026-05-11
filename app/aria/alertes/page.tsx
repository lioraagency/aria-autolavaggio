import AriaHeader from "@/components/AriaHeader";

type AlertType = "rdv" | "annulation" | "rappel" | "vide" | "demande";

interface AlertItem {
  id:      string;
  type:    AlertType;
  title:   string;
  body:    string;
  time:    string;
  section: "nouveau" | "aujourd_hui" | "archives";
  read:    boolean;
}

const ALERTS: AlertItem[] = [
  { id: "a1", type: "rdv",       section: "nouveau",       read: false, time: "Il y a 5 min",   title: "Nouveau RDV",             body: "Sarah B. a réservé Extérieur seul · 13h30" },
  { id: "a2", type: "rappel",    section: "aujourd_hui",   read: false, time: "Dans 15 min",    title: "RDV dans 15 min",          body: "Martin L. · Service Complet · 10h00" },
  { id: "a3", type: "annulation",section: "aujourd_hui",   read: true,  time: "Ce matin 8h12",  title: "Annulation",               body: "Jean-Marc P. a annulé son RDV de 14h30" },
  { id: "a4", type: "vide",      section: "aujourd_hui",   read: true,  time: "Ce matin 7h00",  title: "Plage disponible",         body: "2h libres entre 11h45 et 13h30 aujourd'hui" },
  { id: "a5", type: "demande",   section: "archives",      read: true,  time: "Hier 17h22",     title: "Demande spéciale",         body: "Louis T. demande un shampoing moteur · +35$" },
  { id: "a6", type: "rdv",       section: "archives",      read: true,  time: "Hier 14h05",     title: "Nouveau RDV",             body: "Pierre D. a réservé Extérieur seul · demain 11h00" },
];

const TYPE_ICONS: Record<AlertType, { icon: string; color: string }> = {
  rdv:        { icon: "📅", color: "text-aria-accent bg-aria-accent/10" },
  annulation: { icon: "✕",  color: "text-red-400 bg-red-400/10" },
  rappel:     { icon: "⏰",  color: "text-amber-400 bg-amber-400/10" },
  vide:       { icon: "○",  color: "text-blue-400 bg-blue-400/10" },
  demande:    { icon: "✉",  color: "text-purple-400 bg-purple-400/10" },
};

const SECTION_LABELS: Record<AlertItem["section"], string> = {
  nouveau:      "Nouveau",
  aujourd_hui:  "Aujourd'hui",
  archives:     "Archives",
};

function AlertRow({ alert }: { alert: AlertItem }) {
  const { icon, color } = TYPE_ICONS[alert.type];
  return (
    <div className={`flex gap-3 p-4 border-b border-aria-border last:border-0 ${!alert.read ? "bg-aria-surface/50" : ""}`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className={`font-condensed text-sm uppercase tracking-wider ${!alert.read ? "text-aria-text font-bold" : "text-aria-dim"}`}>
            {alert.title}
          </p>
          {!alert.read && (
            <div className="w-2 h-2 rounded-full bg-aria-accent flex-shrink-0" aria-label="Non lu" />
          )}
        </div>
        <p className="text-aria-muted text-xs leading-snug">{alert.body}</p>
        <p className="text-aria-muted/60 text-[10px] mt-1 font-condensed">{alert.time}</p>
      </div>
    </div>
  );
}

export default function AlertesPage() {
  const sections: AlertItem["section"][] = ["nouveau", "aujourd_hui", "archives"];

  return (
    <div className="animate-fade-in">
      <AriaHeader alertCount={2} />

      <div className="px-4 pt-2 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-condensed font-black text-2xl uppercase tracking-tight text-aria-text">
            Alertes
          </h1>
          <button className="text-aria-muted text-xs font-condensed uppercase tracking-wider active:text-aria-text transition-colors">
            Tout lire
          </button>
        </div>

        {sections.map((section) => {
          const items = ALERTS.filter((a) => a.section === section);
          if (items.length === 0) return null;
          return (
            <div key={section}>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="font-condensed font-black text-xs uppercase tracking-widest text-aria-accent">
                  {SECTION_LABELS[section]}
                </h2>
                <div className="flex-1 h-px bg-aria-border" />
              </div>
              <div className="bg-aria-surface border border-aria-border rounded-xl overflow-hidden">
                {items.map((a) => <AlertRow key={a.id} alert={a} />)}
              </div>
            </div>
          );
        })}

        <p className="text-center text-aria-muted text-xs font-condensed uppercase tracking-wider py-4">
          ARIA v0.1 — Alertes temps réel bientôt
        </p>
      </div>
    </div>
  );
}
