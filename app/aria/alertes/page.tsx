"use client";

import { useEffect, useState, useCallback } from "react";
import AriaHeader from "@/components/AriaHeader";

type AlertType = "rdv" | "annulation" | "rappel" | "vide" | "demande";

interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<AlertType, { icon: string; color: string }> = {
  rdv:        { icon: "📅", color: "text-aria-accent bg-aria-accent/10" },
  annulation: { icon: "✕",  color: "text-red-400 bg-red-400/10" },
  rappel:     { icon: "⏰",  color: "text-amber-400 bg-amber-400/10" },
  vide:       { icon: "○",  color: "text-blue-400 bg-blue-400/10" },
  demande:    { icon: "✉",  color: "text-purple-400 bg-purple-400/10" },
};

function relativeTime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (mins < 1)   return "À l'instant"
  if (mins < 60)  return `Il y a ${mins} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days === 1) return "Hier"
  return `Il y a ${days} jours`
}

function isToday(isoStr: string): boolean {
  const d = new Date(isoStr)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

function isYesterday(isoStr: string): boolean {
  const d = new Date(isoStr)
  const yesterday = new Date(Date.now() - 86_400_000)
  return d.getFullYear() === yesterday.getFullYear() && d.getMonth() === yesterday.getMonth() && d.getDate() === yesterday.getDate()
}

type Section = "nouveau" | "aujourd_hui" | "archives"

const SECTION_LABELS: Record<Section, string> = {
  nouveau:     "Nouveau",
  aujourd_hui: "Aujourd'hui",
  archives:    "Archives",
}

function classifySection(alert: AlertItem): Section {
  if (!alert.isRead) return "nouveau"
  if (isToday(alert.createdAt)) return "aujourd_hui"
  return "archives"
}

function AlertRow({ alert, onMarkRead }: { alert: AlertItem; onMarkRead: (id: string) => void }) {
  const { icon, color } = TYPE_ICONS[alert.type] ?? TYPE_ICONS.rdv;
  return (
    <div
      className={`flex gap-3 p-4 border-b border-aria-border last:border-0 active:bg-aria-elevated transition-colors ${!alert.isRead ? "bg-aria-surface/50" : ""}`}
      onClick={() => !alert.isRead && onMarkRead(alert.id)}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className={`font-condensed text-sm uppercase tracking-wider ${!alert.isRead ? "text-aria-text font-bold" : "text-aria-dim"}`}>
            {alert.title}
          </p>
          {!alert.isRead && (
            <div className="w-2 h-2 rounded-full bg-aria-accent flex-shrink-0" aria-label="Non lu" />
          )}
        </div>
        <p className="text-aria-muted text-xs leading-snug">{alert.body}</p>
        <p className="text-aria-muted/60 text-[10px] mt-1 font-condensed">{relativeTime(alert.createdAt)}</p>
      </div>
    </div>
  );
}

export default function AlertesPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.alerts)) {
        setAlerts(data.alerts);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAlerts() }, [fetchAlerts]);

  const unreadCount = alerts.filter(a => !a.isRead).length;

  async function handleMarkRead(id: string) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
    try {
      await fetch(`/api/alerts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead", id }),
      });
    } catch { /* ignore */ }
  }

  async function handleMarkAllRead() {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    try {
      await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });
    } catch { /* ignore */ }
  }

  const sections: Section[] = ["nouveau", "aujourd_hui", "archives"];

  const grouped = sections
    .map(section => ({
      section,
      items: alerts.filter(a => classifySection(a) === section),
    }))
    .filter(g => g.items.length > 0);

  return (
    <div className="animate-fade-in">
      <AriaHeader alertCount={unreadCount} />

      <div className="px-4 pt-2 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-condensed font-black text-2xl uppercase tracking-tight text-aria-text">
            Alertes
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-aria-muted text-xs font-condensed uppercase tracking-wider active:text-aria-text transition-colors"
            >
              Tout lire
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 rounded-full border-2 border-aria-accent border-t-transparent animate-spin" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="bg-aria-surface border border-aria-border rounded-xl p-8 text-center">
            <p className="text-aria-muted font-condensed uppercase tracking-wider text-sm">Aucune alerte</p>
          </div>
        ) : (
          grouped.map(({ section, items }) => (
            <div key={section}>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="font-condensed font-black text-xs uppercase tracking-widest text-aria-accent">
                  {SECTION_LABELS[section]}
                </h2>
                <div className="flex-1 h-px bg-aria-border" />
                {section === "nouveau" && (
                  <span className="font-condensed text-[10px] text-aria-accent uppercase tracking-wider">
                    {items.length} non lu{items.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="bg-aria-surface border border-aria-border rounded-xl overflow-hidden">
                {items.map(a => (
                  <AlertRow key={a.id} alert={a} onMarkRead={handleMarkRead} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
