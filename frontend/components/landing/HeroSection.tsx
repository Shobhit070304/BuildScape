import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Terminal,
  CheckCircle2,
  CircleDot,
  Lock,
  Code2,
  ExternalLink,
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,_#c9a96e,_transparent_65%)] opacity-15 blur-[100px]" />
        <div className="absolute top-64 right-[-100px] h-[400px] w-[500px] rounded-full bg-[radial-gradient(ellipse,_#7dd3fc,_transparent_70%)] opacity-[0.06] blur-[110px]" />
      </div>

      <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
        {/* Left Column: Headline & Value Prop */}
        <div className="lg:col-span-7">
          {/* Eyebrow Badge */}
          <div className="mb-6 inline-flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-800/40 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-transparent px-3.5 py-1 text-xs font-medium text-[#d4b577] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Project-Based Engineering Platform</span>
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="mb-6 font-serif text-4xl font-bold leading-[1.08] tracking-tight text-[#f0eae1] sm:text-5xl lg:text-6xl">
            The best way to learn
            <br />
            is to{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-[#c9a96e] bg-clip-text text-transparent">
              build real systems.
            </span>
          </h1>

          <p className="mb-8 max-w-xl text-base leading-relaxed text-[#9e9587] sm:text-[1.0625rem]">
            Escape tutorial hell. Build production-grade full-stack applications with guided architecture blueprints, step-by-step code guidance, and live deployments.
          </p>

          {/* CTA Buttons */}
          <div className="mb-10 flex flex-wrap items-center gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-lg border border-amber-600/50 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 px-5 py-3 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-950/30 transition-all duration-200 hover:opacity-95 hover:shadow-amber-900/40 active:scale-[0.99]"
            >
              <span>Explore Projects</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-lg border border-[#2a2620] bg-[#14120f]/80 px-5 py-3 text-sm font-medium text-[#d4cbbd] backdrop-blur-sm transition-all duration-200 hover:border-[#3d3830] hover:bg-[#1a1713] hover:text-white"
            >
              <span>See How It Works</span>
            </Link>
          </div>

          {/* Tech stack pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[#6b6256] mr-1">Core Tracks:</span>
            {["Next.js", "Node.js", "TypeScript", "PostgreSQL", "MongoDB", "REST APIs"].map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-[#24211b] bg-[#12100d] px-2.5 py-1 text-xs font-medium text-[#a39a8c] transition-colors hover:border-[#38332a] hover:text-[#e4ddd3]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Workspace Mockup Card */}
        <div className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-2xl border border-[#2a251e] bg-[#0e0d0b] shadow-2xl shadow-black/80">
            {/* Window title bar */}
            <div className="flex items-center justify-between border-b border-[#201d18] bg-[#14120f] px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#28ca41]" />
                </div>
                <span className="ml-2 font-mono text-[0.7rem] text-[#7a7168]">
                  workspace — phase-3.tsx
                </span>
              </div>
              <span className="rounded-full border border-amber-800/40 bg-amber-950/40 px-2 py-0.5 text-[0.65rem] font-semibold text-[#c9a96e]">
                Phase 3 of 5
              </span>
            </div>

            {/* Workspace Inner */}
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between border-b border-[#1f1c17] pb-3">
                <div>
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#7a7168]">
                    Next.js Track · Beginner
                  </span>
                  <h3 className="font-serif text-base font-semibold text-[#e4ddd3]">
                    Markdown Blog with Next.js
                  </h3>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-semibold text-emerald-400">
                    60% Complete
                  </div>
                  <div className="text-[0.62rem] text-[#7a7168]">+300 XP Earned</div>
                </div>
              </div>

              {/* Progress Stepper Mini */}
              <div className="mb-4 space-y-1.5 rounded-xl border border-[#201d18] bg-[#14120f] p-3 text-xs">
                <div className="flex items-center gap-2 text-[#5a9c6f]">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="line-through decoration-[#3a3530] text-[#7a7168]">
                    Phase 1: Project Setup & Folders
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#5a9c6f]">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="line-through decoration-[#3a3530] text-[#7a7168]">
                    Phase 2: Content Layer & Markdown
                  </span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-[#d4b577] bg-amber-950/30 rounded px-2 py-1 border border-amber-800/30">
                  <CircleDot className="h-3.5 w-3.5 text-[#c9a96e] shrink-0 animate-pulse" />
                  <span>Phase 3: Routing & Static Generation</span>
                </div>
                <div className="flex items-center gap-2 text-[#4a4540] px-2 py-0.5">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  <span>Phase 4: Syntax Highlighting & Prose</span>
                </div>
                <div className="flex items-center gap-2 text-[#4a4540] px-2 py-0.5">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  <span>Phase 5: Production Vercel Deploy</span>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="rounded-xl border border-[#201d18] bg-[#080807] p-3.5 font-mono text-[0.7rem] leading-relaxed">
                <div className="mb-1.5 flex items-center justify-between text-[#6a6560]">
                  <span className="flex items-center gap-1.5 text-xs text-[#8a8178]">
                    <Code2 className="h-3.5 w-3.5 text-[#c9a96e]" />
                    app/blog/[slug]/page.tsx
                  </span>
                  <Terminal className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="text-amber-400">export async function</span>{" "}
                  <span className="text-sky-300">generateStaticParams</span>() &#123;
                </div>
                <div className="text-[#6a6560]">&nbsp;&nbsp;// Pre-renders all posts at build time</div>
                <div>
                  &nbsp;&nbsp;<span className="text-amber-400">return</span>{" "}
                  <span className="text-sky-300">getAllPosts</span>().<span className="text-emerald-400">map</span>((p) =&gt; (&#123; slug: p.slug &#125;));
                </div>
                <div>&#125;</div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between border-t border-[#1f1c17] bg-[#14120f] px-5 py-3 text-xs">
              <span className="text-[0.72rem] text-[#8a8178]">
                Estimated time: <strong className="text-[#e4ddd3]">8 hours</strong>
              </span>
              <Link
                href="/projects/markdown-blog-nextjs"
                className="group flex items-center gap-1 text-[0.75rem] font-semibold text-[#c9a96e] transition-colors hover:text-[#d4b577]"
              >
                <span>View Curriculum</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
