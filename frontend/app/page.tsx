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
import { ReviewsSection } from "@/components/landing/ReviewsSection";
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
        {/* Rich Ambient Atmospheric Radial Gradients */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-full max-w-7xl -translate-x-1/2 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.18),rgba(147,51,234,0.08)_40%,transparent_75%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-[-10%] top-[25%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.07)_0%,transparent_70%)] blur-[100px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-[-10%] top-[40%] h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.06)_0%,transparent_70%)] blur-[120px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-[15%] top-[65%] h-[650px] w-[650px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.07)_0%,transparent_70%)] blur-[110px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-[10%] top-[82%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.05)_0%,transparent_70%)] blur-[110px]"
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
          <ReviewsSection />
          <FaqSection />
        </div>
      </main>
      <FooterSection />
    </>
  );
}
