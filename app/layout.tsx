import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-barlow",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "900"],
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
        {/* Vercel Web Analytics : file d'attente window.va, puis script servi par Vercel */}
        <Script id="vercel-analytics-queue" strategy="afterInteractive">
          {"window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };"}
        </Script>
        <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
