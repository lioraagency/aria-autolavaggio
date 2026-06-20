import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-barlow",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["300", "400", "600", "900"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://aria-autolavaggio-lioraagencys-projects.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Autolavaggio — Lavage auto à la main · Sainte-Foy",
    template: "%s · Autolavaggio",
  },
  description: "Lavage auto manuel professionnel à Sainte-Foy, Québec. Service extérieur, intérieur et complet. Réservation en ligne en 60 secondes.",
  manifest: "/manifest.json",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚗</text></svg>",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Autolavaggio",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0A0A",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body className="font-sans bg-aria-bg text-aria-text antialiased">
        {children}
      </body>
    </html>
  );
}
