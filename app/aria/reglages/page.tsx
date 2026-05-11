import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/auth";
import type { SessionData } from "@/lib/auth";
import AriaHeader from "@/components/AriaHeader";
import LogoutButton from "./LogoutButton";
import { ARIA_VERSION } from "@/lib/config";

async function getSession(): Promise<SessionData | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getIronSession<SessionData>(cookies() as any, sessionOptions);
    return session.isLoggedIn ? session : null;
  } catch { return null; }
}

function SettingRow({ label, value, disabled = false, children }: {
  label: string; value?: string; disabled?: boolean; children?: React.ReactNode
}) {
  return (
    <div className={`flex items-center justify-between py-4 border-b border-aria-border last:border-0 ${disabled ? "opacity-40" : ""}`}>
      <span className="font-condensed text-sm uppercase tracking-wider text-aria-text">{label}</span>
      {value    && <span className="text-aria-muted text-sm">{value}</span>}
      {children}
    </div>
  );
}

function Toggle() {
  return (
    <div className="w-11 h-6 rounded-full bg-aria-surface border border-aria-border flex items-center px-0.5">
      <div className="w-5 h-5 rounded-full bg-aria-muted" />
    </div>
  );
}

export default async function ReglagesPage() {
  const session = await getSession();

  return (
    <div className="animate-fade-in">
      <AriaHeader alertCount={1} />

      <div className="px-4 pt-2 pb-8 space-y-5">
        <h1 className="font-condensed font-black text-2xl uppercase tracking-tight text-aria-text">Réglages</h1>

        <section>
          <p className="font-condensed text-xs uppercase tracking-widest text-aria-accent mb-2">Compte</p>
          <div className="bg-aria-surface border border-aria-border rounded-xl px-4 overflow-hidden">
            <SettingRow label="Utilisateur" value={session?.userName ?? "—"} />
            <SettingRow label="Rôle"        value={session?.role === "owner" ? "Propriétaire" : "Démo"} />
            <SettingRow label="Changer PIN" disabled>
              <span className="text-aria-muted text-xs font-condensed uppercase tracking-wider">Bientôt</span>
            </SettingRow>
          </div>
        </section>

        <section>
          <p className="font-condensed text-xs uppercase tracking-widest text-aria-accent mb-2">Notifications</p>
          <div className="bg-aria-surface border border-aria-border rounded-xl px-4 overflow-hidden">
            <SettingRow label="Push"><Toggle /></SettingRow>
            <SettingRow label="Email"><Toggle /></SettingRow>
            <SettingRow label="In-app"><Toggle /></SettingRow>
          </div>
        </section>

        <section>
          <p className="font-condensed text-xs uppercase tracking-widest text-aria-accent mb-2">Cal.com</p>
          <div className="bg-aria-surface border border-aria-border rounded-xl px-4 overflow-hidden">
            <SettingRow label="API Key"     value="Non configurée" />
            <SettingRow label="Calendrier"  value="Données mockées" />
            <div className="py-3">
              <a href="https://cal.com/settings/developer/api-keys" target="_blank" rel="noopener noreferrer"
                 className="text-aria-accent text-xs font-condensed uppercase tracking-wider">
                Configurer sur cal.com →
              </a>
            </div>
          </div>
        </section>

        <section>
          <p className="font-condensed text-xs uppercase tracking-widest text-aria-accent mb-2">À propos</p>
          <div className="bg-aria-surface border border-aria-border rounded-xl px-4 overflow-hidden">
            <SettingRow label="Version"       value={`ARIA ${ARIA_VERSION}`} />
            <SettingRow label="Client"        value="Autolavaggio" />
            <SettingRow label="Développé par" value="LIORA" />
          </div>
        </section>

        <LogoutButton />

        <p className="text-center text-aria-muted/50 text-[10px] font-condensed uppercase tracking-widest">
          ARIA {ARIA_VERSION} · by LIORA
        </p>
      </div>
    </div>
  );
}
