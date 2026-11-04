import { SITE_URL } from "@/lib/config";
import { HOURS_BY_DOW } from "@/lib/hours";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;

// Heures tirées de lib/hours.ts, regroupées par plage identique. Aucune note, aucun avis, aucun prix.
function openingHours() {
  const groups = new Map<string, string[]>();
  for (let dow = 0; dow < 7; dow++) {
    const h = HOURS_BY_DOW[dow];
    if (!h) continue;
    const key = `${hh(h.open)}-${hh(h.close)}`;
    groups.set(key, [...(groups.get(key) ?? []), DAY_NAMES[dow]]);
  }
  return Array.from(groups, ([range, days]) => {
    const [opens, closes] = range.split("-");
    return { "@type": "OpeningHoursSpecification", dayOfWeek: days, opens, closes };
  });
}

export default function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "AutoWash",
    name: "Auto Lavaggio",
    url: SITE_URL,
    telephone: "+1-581-705-3005",
    address: {
      "@type": "PostalAddress",
      streetAddress: "2125 chemin Ste-Foy",
      addressLocality: "Québec",
      addressRegion: "QC",
      addressCountry: "CA",
    },
    openingHoursSpecification: openingHours(),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
