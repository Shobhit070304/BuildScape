import {
  Code2,
  Terminal,
  CheckCircle2,
  Cloud,
  Sparkles,
  GitBranch,
} from "lucide-react";

export function FeaturesSection() {
  return (
    <section id="features" className="mb-20 sm:mb-28 lg:mb-32 scroll-mt-24">
      {/* Section Header */}
      <div className="mb-12 text-center">
        <div className="mb-3 inline-flex">
          <span className="pill-mono">
            <Sparkles className="h-3 w-3 text-white" />
            <span>ENGINEERING CAPABILITIES</span>
          </span>
        </div>
        <h2 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
          Built for engineers who demand rigor.
        </h2>
        <p className="mx-auto max-w-xl text-sm sm:text-base leading-relaxed text-neutral-400">
          No shallow toy examples. Every blueprint covers production telemetry, real database transactions, concurrency safety, and cloud deployments.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Bento 1: Wide Card (span 2) */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-7 md:col-span-2 transition-all duration-200 hover:border-white/20 hover:bg-[#0E0E14] shadow-2xl shadow-black/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white shadow-xs">
              <Code2 className="h-5 w-5" />
            </div>
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-neutral-300">
              Architecture First
            </span>
          </div>

          <h3 className="mb-2.5 font-sans text-xl font-bold text-white group-hover:text-neutral-100 transition-colors">
            Understand the system before writing code
          </h3>
          <p className="mb-6 max-w-xl text-xs sm:text-sm leading-relaxed text-neutral-400">
            Every phase starts with mental models and architectural decisions. You learn why entities are modeled, how data streams between services, and why specific patterns are chosen over alternatives.
          </p>

          {/* Mini Interactive Architecture Preview */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.08] bg-[#060608] p-3.5 text-xs font-mono text-neutral-300">
            <span className="rounded-md bg-white/[0.06] border border-white/10 px-2.5 py-1 text-white font-semibold">
              [HTTP Request]
            </span>
            <span className="text-neutral-600">➔</span>
            <span className="rounded-md bg-white/[0.06] border border-white/10 px-2.5 py-1 text-neutral-200 font-semibold">
              [Chi Router &amp; Auth]
            </span>
            <span className="text-neutral-600">➔</span>
            <span className="rounded-md bg-white/[0.06] border border-white/10 px-2.5 py-1 text-neutral-200 font-semibold">
              [Domain Service]
            </span>
            <span className="text-neutral-600">➔</span>
            <span className="rounded-md bg-white/[0.06] border border-white/10 px-2.5 py-1 text-emerald-300 font-semibold">
              [PostgreSQL / pgx]
            </span>
          </div>
        </div>

        {/* Bento 2: Standard Card (span 1) */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-7 transition-all duration-200 hover:border-white/20 hover:bg-[#0E0E14] shadow-xl shadow-black/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white shadow-xs">
              <Terminal className="h-5 w-5" />
            </div>
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-neutral-300">
              CLI &amp; Shell
            </span>
          </div>

          <h3 className="mb-2 font-sans text-base font-bold text-white">
            Tested commands that just work
          </h3>
          <p className="mb-4 text-xs leading-relaxed text-neutral-400">
            No version drift or missing flags. Every single command is pinned and verified against modern runtimes.
          </p>

          <div className="rounded-xl border border-white/[0.08] bg-[#060608] p-3 font-mono text-[11px] text-emerald-400">
            $ go test -v -race ./internal/...<br />
            <span className="text-neutral-500">PASS: TestStreakEngine (0.03s)</span>
          </div>
        </div>

        {/* Bento 3: Standard Card (span 1) */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-7 transition-all duration-200 hover:border-white/20 hover:bg-[#0E0E14] shadow-xl shadow-black/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-emerald-400 shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="rounded-md border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
              Strict Quality
            </span>
          </div>

          <h3 className="mb-2 font-sans text-base font-bold text-white">
            Automated Checkpoints
          </h3>
          <p className="mb-4 text-xs leading-relaxed text-neutral-400">
            You never guess if your code works. Each phase concludes with automated verification checks and concrete test suites.
          </p>

          <div className="rounded-xl border border-white/[0.08] bg-[#060608] p-3 font-mono text-[11px] text-neutral-300 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All 8 phases verified</span>
          </div>
        </div>

        {/* Bento 4: Wide Card (span 2) */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-7 md:col-span-2 transition-all duration-200 hover:border-white/20 hover:bg-[#0E0E14] shadow-2xl shadow-black/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white shadow-xs">
              <Cloud className="h-5 w-5" />
            </div>
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-neutral-300">
              Cloud Ready
            </span>
          </div>

          <h3 className="mb-2.5 font-sans text-xl font-bold text-white group-hover:text-neutral-100 transition-colors">
            Deploy to real cloud infrastructure
          </h3>
          <p className="mb-5 max-w-xl text-xs sm:text-sm leading-relaxed text-neutral-400">
            Stop leaving projects stranded on localhost. Every blueprint finishes with a multi-stage Docker build, CI configuration, and live cloud deployment you can put on your resume.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-400">
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#060608] px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-neutral-200">Live URL: habitly-api.onrender.com</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-500">
              <GitBranch className="h-3.5 w-3.5" />
              <span>github.com/developer/habitly-go</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
