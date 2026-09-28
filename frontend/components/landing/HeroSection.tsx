import Link from "next/link";
import { ArrowRight, Star, Terminal, CheckCircle2, CircleDot, Lock } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative py-16 sm:py-24">
      {/* Ambient glowing orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 left-1/3 h-[450px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,_#c9a96e,_transparent_65%)] opacity-20 blur-[90px]" />
        <div className="absolute top-48 right-10 h-[350px] w-[450px] rounded-full bg-[radial-gradient(ellipse,_#7dd3fc,_transparent_65%)] opacity-[0.08] blur-[90px]" />
      </div>

      <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
        {/* Left Column: Value Prop */}
        <div className="lg:col-span-7">
          {/* Eyebrow */}
          <div className="mb-6 inline-flex">
            <span className="pill-amber">
              <Star className="h-3.5 w-3.5" />
              100% free · No account needed · Build real projects
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 font-serif text-4xl font-bold leading-[1.08] tracking-tight text-[#e8e0d5] sm:text-5xl lg:text-6xl">
            The best way
            <br />
            to learn is to{" "}
            <span className="gradient-text-amber">
              build.
            </span>
          </h1>

          <p className="mb-8 max-w-xl text-base leading-relaxed text-[#8a8178] sm:text-[1.0625rem]">
            BuildScape is a project-based learning platform where you escape tutorial hell by building complete,
            real-world projects — phase by phase, concept by concept, with full code guidance.
          </p>

          {/* CTA Buttons */}
          <div className="mb-8 flex flex-wrap items-center gap-3.5">
            <Link href="/projects" className="btn-primary-amber">
              Browse projects
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#how-it-works" className="btn-secondary-dark">
              See how it works
            </Link>
          </div>

          {/* Tech stack tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[#7a7168]">Tracks:</span>
            {["Next.js", "Node.js", "TypeScript", "PostgreSQL", "React", "Docker"].map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-[#2a2a2a] bg-[#141414] px-2.5 py-1 text-xs font-medium text-[#a8a09a]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Workspace Preview Card */}
        <div className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-2xl border border-[#262626] bg-[#0c0c0c] shadow-2xl">
            {/* Window title bar */}
            <div className="flex items-center justify-between border-b border-[#1a1a1a] bg-[#121212] px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#28ca41]" />
                <span className="ml-2 font-mono text-[0.7rem] text-[#6a6560]">
                  workspace — phase-3.md
                </span>
              </div>
              <span className="rounded bg-amber-950/50 px-2 py-0.5 text-[0.65rem] font-semibold text-[#c9a96e]">
                Phase 3 of 5
              </span>
            </div>

            {/* Workspace Inner */}
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#7a7168]">
                    Next.js Track · Beginner
                  </span>
                  <h3 className="font-serif text-base font-semibold text-[#e4ddd3]">
                    Markdown Blog with Next.js
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-[0.68rem] font-semibold text-[#5a9c6f]">
                    40% Complete
                  </div>
                  <div className="text-[0.62rem] text-[#7a7168]">+300 XP Earned</div>
                </div>
              </div>

              {/* Progress Stepper Mini */}
              <div className="mb-4 space-y-1.5 rounded-lg border border-[#1e1e1e] bg-[#111111] p-3">
                <div className="flex items-center gap-2 text-xs text-[#5a9c6f]">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="line-through decoration-[#3a3530] text-[#7a7168]">
                    1. Project Setup & Folders
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#5a9c6f]">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="line-through decoration-[#3a3530] text-[#7a7168]">
                    2. Content Layer (gray-matter)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#e8c88a]">
                  <CircleDot className="h-3.5 w-3.5 text-[#c9a96e] shrink-0" />
                  <span>3. Blog Routing & Layout</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#4a4540]">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  <span>4. Markdown & Syntax Highlighting</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#4a4540]">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  <span>5. Production Deployment to Vercel</span>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="rounded-lg border border-[#1e1e1e] bg-[#070707] p-3 font-mono text-[0.68rem] leading-relaxed">
                <div className="mb-1 flex items-center justify-between text-[#6a6560]">
                  <span>app/blog/[slug]/page.tsx</span>
                  <Terminal className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="text-[#c9a96e]">export async function</span>{" "}
                  <span className="text-[#9da8c8]">generateStaticParams</span>() &#123;
                </div>
                <div className="text-[#6a6560]">&nbsp;&nbsp;// Pre-renders all posts at build time</div>
                <div>
                  &nbsp;&nbsp;<span className="text-[#c9a96e]">return</span>{" "}
                  <span className="text-[#9da8c8]">getAllPosts</span>().<span className="text-[#9da8c8]">map</span>((p) =&gt; (&#123; slug: p.slug &#125;));
                </div>
                <div>&#125;</div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between border-t border-[#1a1a1a] bg-[#0f0f0f] px-4 py-2.5 text-xs">
              <span className="text-[0.7rem] text-[#7a7168]">
                Estimated time: <strong className="text-[#c8c0b4]">8 hours</strong>
              </span>
              <Link
                href="/projects/markdown-blog-nextjs"
                className="text-[0.72rem] font-semibold text-[#c9a96e] hover:underline"
              >
                Open workspace &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
