import { Compass, Terminal, Rocket, CheckCircle2, Zap, GitCommit, ShieldCheck, Database } from "lucide-react";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-24 border-b border-white/[0.08] scroll-mt-24 relative">
      {/* Section Header */}
      <div className="mb-14 text-center">
        <div className="mb-2.5 inline-flex">
          <span className="pill-mono">
            <Zap className="h-3 w-3 text-white" />
            <span>THE EXECUTION PIPELINE</span>
          </span>
        </div>
        <h2 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
          Curriculum, not a passive code dump.
        </h2>
        <p className="mx-auto max-w-lg text-xs sm:text-sm leading-relaxed text-neutral-400">
          You write every line of code in your local editor. Milestone by milestone, backed by deep mental models, automated test checkpoints, and a production cloud deployment.
        </p>
      </div>

      {/* 3-Stage Connected Engineering Pipeline */}
      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Stage 1: Architecture & Mental Models */}
        <div className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-6 sm:p-7 transition-all duration-300 hover:border-white/20 hover:bg-[#0E0E14] shadow-xl shadow-black/70 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white">
                <Compass className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-semibold text-neutral-400 uppercase tracking-wider rounded border border-white/10 bg-white/[0.03] px-2 py-0.5">
                  STAGE 01
                </span>
                <span className="font-mono text-2xl font-black text-neutral-700">01</span>
              </div>
            </div>

            <h3 className="font-sans text-base sm:text-lg font-bold text-white mb-2">
              System Architecture &amp; Data Modeling
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-neutral-400 mb-5">
              Before writing code, study the high-level system diagrams, database relational schemas, and architectural trade-offs.
            </p>

            {/* Micro Architecture Visual Widget */}
            <div className="rounded-xl border border-white/[0.08] bg-[#060608] p-3 font-mono text-[11px] mb-5 space-y-1.5">
              <div className="flex items-center justify-between text-neutral-500 pb-1 border-b border-white/[0.06] text-[10px]">
                <span>RELATIONAL SCHEMA</span>
                <span className="text-emerald-400">NORMALIZED (3NF)</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <Database className="h-3 w-3 text-neutral-400 shrink-0" />
                <span className="text-white font-semibold">habits</span>
                <span className="text-neutral-500">→</span>
                <span className="text-neutral-300">completions (1:N)</span>
              </div>
              <div className="text-[10px] text-neutral-400 pl-5">
                INDEX: (user_id, completed_at DESC)
              </div>
            </div>

            <ul className="space-y-2 border-t border-white/[0.06] pt-4 text-xs text-neutral-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                <span>Production stacks (pgx, Chi, Zod, Redis)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                <span>Zero version drift with pinned packages</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Stage 2: Local Coding & Automated Checkpoints (Highlighted Core) */}
        <div className="group relative flex flex-col justify-between rounded-2xl border border-white/20 bg-[#0F0F16] p-6 sm:p-7 transition-all duration-300 hover:border-white/30 shadow-2xl shadow-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]">
          {/* Core Workflow floating badge */}
          <span className="absolute -top-3 right-6 rounded-full border border-white/20 bg-white px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-black shadow-lg">
            Core Workflow
          </span>

          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.08] text-white">
                <Terminal className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-semibold text-neutral-300 uppercase tracking-wider rounded border border-white/20 bg-white/[0.08] px-2 py-0.5">
                  STAGE 02
                </span>
                <span className="font-mono text-2xl font-black text-neutral-500">02</span>
              </div>
            </div>

            <h3 className="font-sans text-base sm:text-lg font-bold text-white mb-2">
              Build Locally with Checkpoints
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-neutral-400 mb-5">
              Work through 8 structured phases. Write the code in VS Code, Cursor, or Neovim, and verify every milestone with automated assertions.
            </p>

            {/* Micro Terminal Test Assertion Widget */}
            <div className="rounded-xl border border-white/[0.12] bg-[#060608] p-3 font-mono text-[11px] mb-5 space-y-1">
              <div className="flex items-center justify-between text-neutral-500 pb-1 border-b border-white/[0.06] text-[10px]">
                <span>TERMINAL RUNNER</span>
                <span className="text-emerald-400 font-bold">ALL PASS (4/4)</span>
              </div>
              <div className="text-neutral-300">$ go test -v -race ./internal/streak/...</div>
              <div className="text-emerald-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>PASS: TestStreakCalculation (0.02s)</span>
              </div>
              <div className="text-emerald-400 pl-3">
                <span>PASS: TestStreakResetOnMissedDay (0.01s)</span>
              </div>
            </div>

            <ul className="space-y-2 border-t border-white/[0.08] pt-4 text-xs text-neutral-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-white shrink-0" />
                <span>Milestone task checklists with instant sync</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-white shrink-0" />
                <span>Strict unit &amp; integration test assertions</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Stage 3: Cloud Deployment & Portfolio Proof */}
        <div className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-6 sm:p-7 transition-all duration-300 hover:border-white/20 hover:bg-[#0E0E14] shadow-xl shadow-black/70 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white">
                <Rocket className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-semibold text-neutral-400 uppercase tracking-wider rounded border border-white/10 bg-white/[0.03] px-2 py-0.5">
                  STAGE 03
                </span>
                <span className="font-mono text-2xl font-black text-neutral-700">03</span>
              </div>
            </div>

            <h3 className="font-sans text-base sm:text-lg font-bold text-white mb-2">
              Ship to GitHub &amp; Deploy Cloud
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-neutral-400 mb-5">
              Every project concludes with multi-stage Docker packaging, health checks, and a live production cloud deployment.
            </p>

            {/* Micro Deployment & Git Proof Widget */}
            <div className="rounded-xl border border-white/[0.08] bg-[#060608] p-3 font-mono text-[11px] mb-5 space-y-1.5">
              <div className="flex items-center justify-between text-neutral-500 pb-1 border-b border-white/[0.06] text-[10px]">
                <span>DEPLOYED PROOF</span>
                <span className="text-emerald-400">ONLINE 200 OK</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-300">
                <GitCommit className="h-3 w-3 text-neutral-400 shrink-0" />
                <span className="text-white">commit 9c4f1a2</span>
                <span className="text-neutral-500">·</span>
                <span className="text-emerald-400">main</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                <span>Docker Alpine Image (14.2 MB)</span>
              </div>
            </div>

            <ul className="space-y-2 border-t border-white/[0.06] pt-4 text-xs text-neutral-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                <span>Live production deployment URL</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                <span>Verifiable portfolio project for tech interviews</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
