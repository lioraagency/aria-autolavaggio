import type { Metadata } from "next";
import Nav from "@/components/site/Nav";
import Hero from "@/components/site/Hero";
import ServicesSection from "@/components/site/ServicesSection";
import HowItWorks from "@/components/site/HowItWorks";
import Testimonials from "@/components/site/Testimonials";
import Gallery from "@/components/site/Gallery";
import Contact from "@/components/site/Contact";
import Footer from "@/components/site/Footer";

export const metadata: Metadata = {
  title: "Autolavaggio — Lavage auto à la main, sans rendez-vous · Sainte-Foy",
  description:
    "Lavage auto manuel professionnel à Sainte-Foy, Québec. Service extérieur, intérieur et complet. Réservation en ligne en 60 secondes. 2125 chemin Ste-Foy.",
  openGraph: {
    title: "Autolavaggio — Lavage auto à la main · Sainte-Foy",
    description: "Lavage manuel professionnel à Sainte-Foy. Réservez en ligne.",
    images: [{ url: "/images/a45bb8bc-f440-43a3-95fb-6e47c7efa2fc.webp" }],
  },
};

export default function HomePage() {
  return (
    <main className="bg-aria-bg text-aria-text overflow-x-hidden">
      <Nav />
      <Hero />
      <ServicesSection />
      <HowItWorks />
      <Testimonials />
      <Gallery />
      <Contact />
      <Footer />
    </main>
  );
}
