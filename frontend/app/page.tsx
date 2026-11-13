import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { FeaturedProjectsSection } from "@/components/landing/FeaturedProjectsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { FooterSection } from "@/components/landing/FooterSection";
import { ScrollSectionTracker } from "@/components/landing/ScrollSectionTracker";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BuildScape — Build Real Production Software | Escape Tutorial Hell",
  description:
    "Stop watching tutorials. Build real-world distributed architectures, cache engines, and streaming systems with phase-by-phase blueprints and a portfolio of completed projects.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <ScrollSectionTracker />
      <main className="w-full bg-[#050507] overflow-x-hidden relative">
        {/* Subtle top spotlight */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-full max-w-7xl -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_70%)] blur-[80px]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <HeroSection />
          <StatsSection />
          <FeaturedProjectsSection />
          <HowItWorksSection />
          <FeaturesSection />
          <ComparisonSection />
          <FaqSection />
          <CtaSection />
        </div>
      </main>
      <FooterSection />
    </>
  );
}
