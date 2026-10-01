import Link from "next/link";
import {
  Compass,
  Code2,
  Rocket,
  CheckCircle2,
  Lock,
  Zap,
} from "lucide-react";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="mb-10 sm:mb-12 scroll-mt-20">
      {/* Section Header */}
      <div className="mb-6 text-center">
        <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-amber-800/40 bg-amber-950/30 px-2.5 py-0.5">
          <Zap className="h-3 w-3 text-[#c9a96e]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9a96e]">
            The Learning Method
          </span>
        </div>
        <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#e4ddd3] mb-1">
          Three steps. One real system you ship.
        </h2>
        <p className="mx-auto max-w-md text-xs leading-relaxed text-[#8a8178]">
          No passive video watching. We give you architectural blueprints, clear code steps, and checkpoints so you build real engineering muscle memory.
        </p>
      </div>

      {/* 3 Step Cards Grid (Tighter, smaller) */}
      <div className="relative mb-5 grid grid-cols-1 gap-3.5 md:grid-cols-3">
        {/* Step 1 */}
        <div className="group relative flex flex-col justify-between rounded-xl border border-[#201d18] bg-[#11100e] p-4 transition-all duration-200 hover:border-[#332e26] hover:bg-[#14120f]">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2a2620] bg-[#161411] text-[#c9a96e]">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-mono text-[10px] font-bold text-[#6b6256]">
                STEP 01
              </span>
            </div>

            <h3 className="mb-1 font-serif text-sm font-semibold text-[#e4ddd3] group-hover:text-white transition-colors">
              Pick Your Project
            </h3>
            <p className="mb-3 text-[11px] leading-relaxed text-[#8a8178]">
              Choose from high-demand tracks like Spring Boot, Go, Rust, or Next.js. Inspect the full system architecture before typing a single line.
            </p>
          </div>

          <ul className="space-y-1.5 border-t border-[#1e1c18] pt-2.5 text-[10px] text-[#8a8178]">
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-[#c9a96e]" />
              <span>Industry-grade architectures (Kafka, Raft)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-[#c9a96e]" />
              <span>Exact prerequisites & time estimates</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-[#c9a96e]" />
              <span>Pinned library versions to eliminate errors</span>
            </li>
          </ul>
        </div>

        {/* Step 2 (Highlighted) */}
        <div className="group relative flex flex-col justify-between rounded-xl border border-amber-700/50 bg-[#14120e] p-4 shadow-sm transition-all duration-200 hover:border-amber-600/70">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-700/50 bg-amber-950/40 text-[#c9a96e]">
                <Code2 className="h-4 w-4" />
              </div>
              <span className="rounded border border-amber-800/40 bg-amber-950/50 px-1.5 py-0.2 font-mono text-[9px] font-bold text-[#c9a96e]">
                CORE WORKFLOW
              </span>
            </div>

            <h3 className="mb-1 font-serif text-sm font-semibold text-[#e4ddd3] group-hover:text-white transition-colors">
              Build Phase-by-Phase
            </h3>
            <p className="mb-3 text-[11px] leading-relaxed text-[#a0978c]">
              Each project is split into 6–8 focused phases. You learn the mental model first, then write clean, production-grade code.
            </p>
          </div>

          <ul className="space-y-1.5 border-t border-[#2a241b] pt-2.5 text-[10px] text-[#a0978c]">
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-[#c9a96e]" />
              <span>Sidebar roadmap with continuous tracking</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-[#c9a96e]" />
              <span>Every command & directory structure provided</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-[#c9a96e]" />
              <span>Strict verification checkpoints for each phase</span>
            </li>
          </ul>
        </div>

        {/* Step 3 */}
        <div className="group relative flex flex-col justify-between rounded-xl border border-[#201d18] bg-[#11100e] p-4 transition-all duration-200 hover:border-[#332e26] hover:bg-[#14120f]">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2a2620] bg-[#161411] text-emerald-400">
                <Rocket className="h-4 w-4" />
              </div>
              <span className="font-mono text-[10px] font-bold text-[#6b6256]">
                STEP 03
              </span>
            </div>

            <h3 className="mb-1 font-serif text-sm font-semibold text-[#e4ddd3] group-hover:text-emerald-300 transition-colors">
              Deploy & Showcase
            </h3>
            <p className="mb-3 text-[11px] leading-relaxed text-[#8a8178]">
              Every project concludes with Docker packaging and cloud deployment. Push to GitHub and showcase live software on your resume.
            </p>
          </div>

          <ul className="space-y-1.5 border-t border-[#1e1c18] pt-2.5 text-[10px] text-[#8a8178]">
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              <span>Live production URL with real HTTPS</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              <span>Impressive GitHub repo to showcase in interviews</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              <span>Proof of engineering competence you can explain</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Visual Roadmap Progression Preview (Compact) */}
      <div className="rounded-xl border border-[#201d18] bg-[#11100e] p-3.5 sm:p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9a96e]">
              Roadmap Experience
            </span>
            <h4 className="font-serif text-xs sm:text-sm font-semibold text-[#e4ddd3]">
              Unlock phases, track progress, and celebrate milestones
            </h4>
          </div>

          {/* Phase progression pill chain */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1 rounded border border-emerald-900/60 bg-emerald-950/30 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>Phase 1 ✓</span>
            </div>
            <div className="flex items-center gap-1 rounded border border-emerald-900/60 bg-emerald-950/30 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>Phase 2 ✓</span>
            </div>
            <div className="flex items-center gap-1 rounded border border-amber-800/60 bg-amber-950/50 px-2 py-0.5 text-[10px] font-semibold text-[#c9a96e] animate-pulse">
              <Zap className="h-3 w-3 text-[#c9a96e]" />
              <span>Phase 3 (Active)</span>
            </div>
            <div className="flex items-center gap-1 rounded border border-[#221f1a] bg-[#14120f] px-2 py-0.5 text-[10px] text-[#6b6256]">
              <Lock className="h-2.5 w-2.5" />
              <span>Phase 4</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
