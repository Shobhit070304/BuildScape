import Link from "next/link";
import { ArrowRight, Rocket } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-8 pb-24">
      <div className="relative overflow-hidden rounded-2xl border border-amber-800/35 bg-gradient-to-br from-amber-950/25 via-[#0e0e0e] to-[#0a0a0a] p-10 text-center sm:p-16">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,_#c9a96e,_transparent_70%)] opacity-20 blur-[70px]"
          aria-hidden="true"
        />

        <div className="relative">
          <div className="mb-6 inline-flex">
            <span className="pill-amber">
              <Rocket className="h-3.5 w-3.5" />
              Ready to start?
            </span>
          </div>

          <h2 className="mb-4 font-serif text-3xl font-bold leading-tight text-[#e4ddd3] sm:text-4xl lg:text-5xl">
            Stop watching.
            <br />
            Start building.
          </h2>
          <p className="mx-auto mb-8 max-w-md text-sm text-[#8a8178] sm:text-base">
            Pick your first project. Work through the phases at your own pace. Ship something real.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/projects" className="btn-primary-amber">
              Browse all projects
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/projects/markdown-blog-nextjs"
              className="btn-secondary-dark"
            >
              Start: Markdown Blog &rarr;
            </Link>
          </div>

          <p className="mt-5 text-xs text-[#5a5450]">
            Free forever · No account · Progress saved locally
          </p>
        </div>
      </div>
    </section>
  );
}
