import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaSection() {
  return (
    <section className="mb-12 sm:mb-14">
      <div className="relative overflow-hidden rounded-2xl border border-[#26221c] bg-gradient-to-b from-[#14120f] to-[#0e0d0b] p-6 text-center sm:p-10 shadow-lg">
        {/* Subtle ambient glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[220px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,_#c9a96e,_transparent_65%)] opacity-10 blur-[80px]"
          aria-hidden="true"
        />

        <div className="relative">
          <div className="mb-3 inline-flex">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-800/40 bg-amber-950/30 px-3 py-0.5 text-[11px] font-medium text-[#c9a96e]">
              <Sparkles className="h-3 w-3 text-[#c9a96e]" />
              <span>Ready to level up your engineering skills?</span>
            </span>
          </div>

          <h2 className="mb-2 font-serif text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#e4ddd3]">
            Stop watching tutorials.
            <br />
            <span className="italic font-normal text-[#c9a96e]">
              Start building real systems.
            </span>
          </h2>

          <p className="mx-auto mb-5 max-w-md text-xs leading-relaxed text-[#8a8178]">
            Pick a production build, work through the guided phases at your own pace, and ship a real application to your developer portfolio.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-2.5">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 rounded border border-amber-600/50 bg-[#d97706] hover:bg-[#b45309] px-4 py-2 text-xs font-semibold text-stone-950 transition-all shadow-xs active:scale-[0.98]"
            >
              <span>Explore All Projects</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/projects/springboot-kafka-ecommerce-microservices"
              className="inline-flex items-center gap-1.5 rounded border border-[#2a2620] bg-[#14120f] px-3.5 py-2 text-xs font-medium text-[#d4cbbd] transition-all hover:border-[#3a352c] hover:text-white"
            >
              <span>Featured: Spring Boot Kafka Microservices →</span>
            </Link>
          </div>

          <p className="mt-4 font-mono text-[10px] text-[#6b6256]">
            100% Free & Open Curriculum • Self-Paced • Production Roadmaps
          </p>
        </div>
      </div>
    </section>
  );
}
