import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaSection() {
  return (
    <section className="mb-24">
      <div className="relative overflow-hidden rounded-3xl border border-amber-700/40 bg-gradient-to-br from-amber-950/30 via-[#12100d] to-[#0a0a0a] p-10 text-center sm:p-16 shadow-2xl shadow-black/80">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,_#c9a96e,_transparent_65%)] opacity-15 blur-[90px]"
          aria-hidden="true"
        />

        <div className="relative">
          <div className="mb-5 inline-flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-700/40 bg-amber-900/20 px-3.5 py-1 text-xs font-medium text-[#d4b577]">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Ready to level up your engineering skills?</span>
            </span>
          </div>

          <h2 className="mb-4 font-serif text-3xl font-bold tracking-tight text-[#f0eae1] sm:text-4xl lg:text-5xl">
            Stop watching tutorials.
            <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-[#c9a96e] bg-clip-text text-transparent">
              Start building real systems.
            </span>
          </h2>

          <p className="mx-auto mb-8 max-w-lg text-xs leading-relaxed text-[#9e9587] sm:text-sm">
            Pick a production build, work through the guided phases at your own pace, and ship a real application to your developer portfolio.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-lg border border-amber-600/50 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 px-6 py-3 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-950/30 transition-all hover:opacity-95 hover:shadow-amber-900/40 active:scale-[0.99]"
            >
              <span>Explore All Projects</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/projects/markdown-blog-nextjs"
              className="inline-flex items-center gap-2 rounded-lg border border-[#2a2620] bg-[#14120f]/80 px-5 py-3 text-sm font-medium text-[#d4cbbd] backdrop-blur-sm transition-all hover:border-[#3d3830] hover:bg-[#1a1713] hover:text-white"
            >
              <span>Featured: Markdown Blog →</span>
            </Link>
          </div>

          <p className="mt-6 text-[0.7rem] text-[#6b6256]">
            100% Free & Open Curriculum • No Credit Card • Self-Paced
          </p>
        </div>
      </div>
    </section>
  );
}
