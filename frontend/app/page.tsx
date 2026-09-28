import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { GamificationSection } from "@/components/landing/GamificationSection";
import { FeaturedProjectsSection } from "@/components/landing/FeaturedProjectsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { TechTracksSection } from "@/components/landing/TechTracksSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { FooterSection } from "@/components/landing/FooterSection";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="w-full">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <HeroSection />
          <StatsSection />
          <HowItWorksSection />
          <GamificationSection />
          <FeaturedProjectsSection />
          <FeaturesSection />
          <TechTracksSection />
          <ComparisonSection />
          <FaqSection />
          <CtaSection />
        </div>
      </main>
      <FooterSection />
    </>
  );
}
