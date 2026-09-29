import Link from "next/link";
import {
  BookOpen,
  Code2,
  Rocket,
  CheckCircle2,
  Lock,
  Trophy,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="mb-24 scroll-mt-20">
      {/* Section Header */}
      <div className="mb-12 text-center">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-800/30 bg-amber-950/25 px-3 py-1">
          <Zap className="h-3.5 w-3.5 text-[#c9a96e]" />
          <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-[#d4b577]">
            Structured Learning Path
          </span>
        </div>
        <h2 className="mb-4 font-serif text-3xl font-bold tracking-tight text-[#f0eae1] sm:text-4xl">
          Three stages. One real project you actually ship.
        </h2>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-[#8a8178] sm:text-base">
          No fragmented tutorials or disconnected snippets. BuildScape guides you from an empty folder to a deployed, production-grade application.
        </p>
      </div>

      {/* 3 Steps Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-10">
        {/* Step 1 */}
        <div className="group relative rounded-2xl border border-[#24211b] bg-[#0e0d0b] p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#38332a] hover:bg-[#12100d] hover:shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-700/40 bg-amber-950/30 text-[#c9a96e] shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6b6256]">
              Stage 01
            </span>
          </div>

          <h3 className="mb-2 font-serif text-xl font-bold text-[#e4ddd3] group-hover:text-[#d4b577] transition-colors">
            Pick Your Project
          </h3>
          <p className="mb-5 text-xs leading-relaxed text-[#8a8178]">
            Browse complete full-stack projects filtered by tech track and difficulty. Real apps you are proud to showcase — not toy counter examples.
          </p>

          <ul className="space-y-2 border-t border-[#1e1c18] pt-4 text-xs text-[#a39a8c]">
            <li className="flex items-center gap-2">
              <span className="text-amber-400">✦</span> Modern tech stacks (Next.js, Node, Mongo)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-amber-400">✦</span> Realistic system requirements
            </li>
            <li className="flex items-center gap-2">
              <span className="text-amber-400">✦</span> Clear time estimation & milestones
            </li>
          </ul>
        </div>

        {/* Step 2 */}
        <div className="group relative rounded-2xl border border-amber-700/40 bg-gradient-to-b from-[#14120f] to-[#0e0d0b] p-7 shadow-lg shadow-black/40 transition-all duration-200 hover:-translate-y-1 hover:border-amber-600/60 hover:shadow-amber-950/20">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-600/50 bg-amber-900/40 text-amber-300 shadow-sm">
              <Code2 className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-amber-950/60 px-2.5 py-0.5 font-mono text-[0.68rem] font-bold uppercase tracking-wider text-[#d4b577] border border-amber-800/40">
              Stage 02 • Core
            </span>
          </div>

          <h3 className="mb-2 font-serif text-xl font-bold text-[#e4ddd3] group-hover:text-amber-300 transition-colors">
            Build Phase-by-Phase
          </h3>
          <p className="mb-5 text-xs leading-relaxed text-[#9e9587]">
            Each build is structured into 5 logical phases. Understand the mental model and architecture first, then write clean, typed code step by step.
          </p>

          <ul className="space-y-2 border-t border-[#24211b] pt-4 text-xs text-[#c4bbb0]">
            <li className="flex items-center gap-2">
              <span className="text-amber-400">✦</span> Mental models explained before code
            </li>
            <li className="flex items-center gap-2">
              <span className="text-amber-400">✦</span> Exact terminal commands & directory layout
            </li>
            <li className="flex items-center gap-2">
              <span className="text-amber-400">✦</span> Checkpoint checklists to test your app
            </li>
          </ul>
        </div>

        {/* Step 3 */}
        <div className="group relative rounded-2xl border border-[#24211b] bg-[#0e0d0b] p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#38332a] hover:bg-[#12100d] hover:shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-700/40 bg-emerald-950/30 text-emerald-400 shadow-sm">
              <Rocket className="h-5 w-5" />
            </div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6b6256]">
              Stage 03
            </span>
          </div>

          <h3 className="mb-2 font-serif text-xl font-bold text-[#e4ddd3] group-hover:text-emerald-300 transition-colors">
            Deploy & Own It
          </h3>
          <p className="mb-5 text-xs leading-relaxed text-[#8a8178]">
            Every project finishes with a live deployment to Vercel or Render. Push to GitHub, configure production environment variables, and ship.
          </p>

          <ul className="space-y-2 border-t border-[#1e1c18] pt-4 text-xs text-[#a39a8c]">
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✦</span> Live production URL on global CDN
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✦</span> Real GitHub portfolio project
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✦</span> Cloud progress & certificate saved
            </li>
          </ul>
        </div>
      </div>

      {/* Interactive Phase Progression Band */}
      <div className="rounded-2xl border border-[#24211b] bg-gradient-to-r from-[#12100e] via-[#16130f] to-[#12100e] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Trophy className="h-4 w-4 text-[#c9a96e]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#d4b577]">
                Gamified Progression
              </span>
            </div>
            <h4 className="font-serif text-lg font-semibold text-[#e4ddd3]">
              Unlock phases, earn XP, and track your accomplishments
            </h4>
            <p className="text-xs text-[#8a8178] mt-1 max-w-lg">
              Sign in with Google to sync your completed phases across devices, or build immediately as a guest with instant local storage saving.
            </p>
          </div>

          {/* Phase progression pill chain */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-800/40 bg-emerald-950/30 px-3 py-1.5 text-xs font-medium text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Phase 1 ✓
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-800/40 bg-emerald-950/30 px-3 py-1.5 text-xs font-medium text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Phase 2 ✓
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-700/60 bg-amber-950/50 px-3 py-1.5 text-xs font-semibold text-amber-300 shadow-sm animate-pulse">
              <Sparkles className="h-3.5 w-3.5 text-[#c9a96e]" />
              Phase 3 (+150 XP)
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#221f1a] bg-[#14120f] px-3 py-1.5 text-xs text-[#5c5449]">
              <Lock className="h-3 w-3" />
              Phase 4
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#221f1a] bg-[#14120f] px-3 py-1.5 text-xs text-[#5c5449]">
              <Lock className="h-3 w-3" />
              Phase 5
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
