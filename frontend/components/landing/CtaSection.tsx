import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaSection() {
  return (
    <section className="mb-20 sm:mb-28 lg:mb-32">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0E] px-6 py-14 text-center sm:px-12 sm:py-20 shadow-2xl shadow-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
        {/* Ambient white spotlight */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_65%)] blur-[90px]"
          aria-hidden="true"
        />

        <div className="relative">
          <div className="mb-4 inline-flex">
            <span className="pill-mono">
              <Sparkles className="h-3 w-3 text-white" />
              <span>START BUILDING TODAY</span>
            </span>
          </div>

          <h2 className="mb-4 font-sans text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Stop watching tutorials.
            <br />
            <span className="gradient-text-titanium">
              Start building real systems.
            </span>
          </h2>

          <p className="mx-auto mb-9 max-w-lg text-sm sm:text-base leading-relaxed text-neutral-400">
            Pick a production build, work through the guided phases at your own pace, and ship verifiable applications to your developer portfolio.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-3.5">
            <Link href="/projects" className="btn-primary px-7! py-3.5! text-sm!">
              <span>Explore All Blueprints</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/projects/habitly-go-rest-api"
              className="btn-secondary px-6! py-3.5! text-sm!"
            >
              Featured: Habitly Go REST API →
            </Link>
          </div>

          <p className="mt-8 font-mono text-[11px] text-neutral-500">
            100% Free &amp; Open Curriculum · Self-Paced · Complete Source Guidance
          </p>
        </div>
      </div>
    </section>
  );
}
