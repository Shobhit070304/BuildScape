import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaSection() {
  return (
    <section className="mb-20 sm:mb-28 lg:mb-32">
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-linear-to-b from-[#131210] to-[#0c0c0b] px-6 py-10 text-center sm:px-12 sm:py-14 shadow-xl">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-70 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,#c9a96e,transparent_60%)] opacity-[0.08] blur-[90px]"
          aria-hidden="true"
        />

        <div className="relative">
          <div className="mb-4 inline-flex">
            <span className="pill-amber">
              <Sparkles className="h-2.5 w-2.5" />
              Ready to level up your engineering skills?
            </span>
          </div>

          <h2 className="mb-3 font-serif text-2xl font-semibold tracking-tight text-text sm:text-3xl lg:text-4xl">
            Stop watching tutorials.
            <br />
            <span className="italic font-normal text-accent">
              Start building real systems.
            </span>
          </h2>

          <p className="mx-auto mb-7 max-w-md text-[0.8125rem] leading-relaxed text-text-muted">
            Pick a production build, work through the guided phases at your own pace, and ship a
            real application to your developer portfolio.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-3">
            <Link href="/projects" className="btn-primary px-6! py-2.5! text-[0.8125rem]!">
              Explore All Projects
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/projects/spring-kafka-banking-ledger"
              className="btn-secondary px-5! py-2.5! text-[0.8125rem]!"
            >
              Featured: Spring Kafka Banking Ledger →
            </Link>
          </div>

          <p className="mt-6 font-mono text-[10px] text-text-faint">
            100% Free & Open Curriculum · Self-Paced · Production Roadmaps
          </p>
        </div>
      </div>
    </section>
  );
}
