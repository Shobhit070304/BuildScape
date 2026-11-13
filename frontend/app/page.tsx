import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { SkillsMarquee } from "@/components/landing/SkillsMarquee";
import { StatsSection } from "@/components/landing/StatsSection";
import { FeaturedProjectsSection } from "@/components/landing/FeaturedProjectsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { CurriculumMatrixSection } from "@/components/landing/CurriculumMatrixSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { VerificationEngineSection } from "@/components/landing/VerificationEngineSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { FooterSection } from "@/components/landing/FooterSection";
import { ScrollSectionTracker } from "@/components/landing/ScrollSectionTracker";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BuildScape — Build Real Production Software | Escape Tutorial Hell",
  description:
    "Stop watching tutorials. Build real-world distributed architectures, cache engines, and streaming systems with phase-by-phase project guides and a portfolio of completed projects.",
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
        {/* Subtle Ambient Radial Lighting Layer */}
        <div
          className="pointer-events-none absolute left-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-indigo-600/5 blur-[160px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-1/4 top-2/3 h-[600px] w-[600px] rounded-full bg-violet-600/5 blur-[180px]"
          aria-hidden="true"
        />

        {/* Full-width Screen Studio Hero Section */}
        <HeroSection />

        {/* Slow Horizontally Scrolling Skills Marquee (Pauses on Hover, Boxless) */}
        <SkillsMarquee />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <StatsSection />
          <FeaturedProjectsSection />
          <HowItWorksSection />
          <CurriculumMatrixSection />
          <FeaturesSection />
          <VerificationEngineSection />
          <ComparisonSection />
          <FaqSection />
        </div>
      </main>
      <FooterSection />
    </>
  );
}
