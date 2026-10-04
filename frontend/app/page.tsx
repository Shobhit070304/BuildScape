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

export default function HomePage() {
  return (
    <>
      <Navbar />
      <ScrollSectionTracker />
      <main className="w-full bg-[#0a0a0a] overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
