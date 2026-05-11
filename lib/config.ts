export const CLIENT_NAME = process.env.CLIENT_NAME ?? "Autolavaggio";
export const NEXT_PUBLIC_CLIENT_NAME = process.env.NEXT_PUBLIC_CLIENT_NAME ?? "Autolavaggio";

export const ARIA_VERSION = "v0.1";

export const BOOKING_URL = "https://appt.link/autolavaggio-8H7M5KaR";

export const SERVICES = [
  { name: "Service Complet",   duration: 90, price: 99,  slug: "complet"   },
  { name: "Extérieur seul",    duration: 45, price: 65,  slug: "exterieur" },
  { name: "Intérieur seul",    duration: 60, price: 70,  slug: "interieur" },
] as const;
