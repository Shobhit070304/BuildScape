import {
  Code2,
  Terminal,
  CheckCircle2,
  GitBranch,
  Cloud,
  Sparkles,
} from "lucide-react";

export function FeaturesSection() {
  return (
    <section id="features" className="mb-20 sm:mb-28 lg:mb-32 scroll-mt-24">
      {/* Section Header */}
      <div className="mb-6 text-center">
        <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-amber-800/40 bg-amber-950/30 px-2.5 py-0.5">
          <Sparkles className="h-3 w-3 text-accent" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
            Engineering Bento
          </span>
        </div>
        <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#e4ddd3] mb-1">
          Designed for developers who learn by building
        </h2>
        <p className="mx-auto max-w-md text-xs leading-relaxed text-[#8a8178]">
          Clean architecture blueprints, verified commands, and structured phase checklists ensure you never get stuck.
        </p>
      </div>

      {/* Bento Grid (Compact, clearly visible) */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* Bento 1: Wide Card (span 2) */}
        <div className="group relative overflow-hidden rounded-xl border border-[#201d18] bg-[#11100e] p-4 md:col-span-2 transition-all duration-200 hover:border-[#332e26] hover:bg-[#14120f]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2a2620] bg-[#161411] text-accent">
              <Code2 className="h-4 w-4" />
            </div>
            <span className="rounded border border-amber-800/40 bg-amber-950/40 px-2 py-0.2 font-mono text-[9px] font-semibold text-accent">
              Architecture First
            </span>
          </div>

          <h3 className="mb-1 font-serif text-sm sm:text-base font-semibold text-[#e4ddd3] group-hover:text-white transition-colors">
            Understand the system before writing code
          </h3>
          <p className="mb-3 max-w-lg text-[11px] leading-relaxed text-[#8a8178]">
            Every phase starts with mental models and architectural decisions. You understand why entities are modeled, how data streams between services, and why specific patterns are chosen.
          </p>

          {/* Mini Interactive Architecture Preview */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#1e1c18] bg-[#090807] p-2 text-[10px] font-mono text-[#a0978c]">
            <span className="rounded bg-[#14120f] border border-[#221f1a] px-1.5 py-0.5 text-accent">
              [Client Request]
            </span>
            <span className="text-[#6b6256]">➔</span>
            <span className="rounded bg-[#14120f] border border-[#221f1a] px-1.5 py-0.5 text-sky-300">
              [API Gateway]
            </span>
            <span className="text-[#6b6256]">➔</span>
            <span className="rounded bg-[#14120f] border border-[#221f1a] px-1.5 py-0.5 text-emerald-300">
              [Kafka Topic]
            </span>
            <span className="text-[#6b6256]">➔</span>
            <span className="rounded bg-[#14120f] border border-[#221f1a] px-1.5 py-0.5 text-amber-300">
              [Worker Service]
            </span>
          </div>
        </div>

        {/* Bento 2: Commands & Setup (span 1) */}
        <div className="group relative flex flex-col justify-between rounded-xl border border-[#201d18] bg-[#11100e] p-4 transition-all duration-200 hover:border-[#332e26] hover:bg-[#14120f]">
          <div>
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-[#2a2620] bg-[#161411] text-sky-400">
              <Terminal className="h-4 w-4" />
            </div>
            <h3 className="mb-1 font-serif text-sm font-semibold text-[#e4ddd3] group-hover:text-white transition-colors">
              Every command included
            </h3>
            <p className="mb-3 text-[11px] leading-relaxed text-[#8a8178]">
              No guessing or missing dependencies. All package versions, Docker configs, and setup steps are verified.
            </p>
          </div>

          <div className="rounded border border-[#1e1c18] bg-[#090807] p-2 font-mono text-[10px] text-[#a0978c]">
            <span className="text-emerald-400">$</span> docker compose up -d postgres
          </div>
        </div>

        {/* Bento 3: Checkpoints (span 1) */}
        <div className="group relative flex flex-col justify-between rounded-xl border border-[#201d18] bg-[#11100e] p-4 transition-all duration-200 hover:border-[#332e26] hover:bg-[#14120f]">
          <div>
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-[#2a2620] bg-[#161411] text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <h3 className="mb-1 font-serif text-sm font-semibold text-[#e4ddd3] group-hover:text-white transition-colors">
              Phase verification
            </h3>
            <p className="mb-3 text-[11px] leading-relaxed text-[#8a8178]">
              Checklists test each phase so you never proceed with broken code or confusing bugs.
            </p>
          </div>

          <div className="space-y-1 rounded border border-[#1e1c18] bg-[#090807] p-2 text-[10px]">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span>✓</span> Unit & Integration Tests Pass
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span>✓</span> Database schema cleanly synced
            </div>
          </div>
        </div>

        {/* Bento 4: Real SaaS Architectures (span 1) */}
        <div className="group relative flex flex-col justify-between rounded-xl border border-[#201d18] bg-[#11100e] p-4 transition-all duration-200 hover:border-[#332e26] hover:bg-[#14120f]">
          <div>
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-[#2a2620] bg-[#161411] text-accent">
              <GitBranch className="h-4 w-4" />
            </div>
            <h3 className="mb-1 font-serif text-sm font-semibold text-[#e4ddd3] group-hover:text-white transition-colors">
              Production patterns
            </h3>
            <p className="mb-3 text-[11px] leading-relaxed text-[#8a8178]">
              Learn industry standards: layered services, DTO validation, stateless JWT, and Redis caching.
            </p>
          </div>

          <div className="flex flex-wrap gap-1">
            <span className="rounded bg-[#14120f] border border-[#221f1a] px-1.5 py-0.5 font-mono text-[9px] text-[#a0978c]">
              Saga Pattern
            </span>
            <span className="rounded bg-[#14120f] border border-[#221f1a] px-1.5 py-0.5 font-mono text-[9px] text-[#a0978c]">
              Raft Consensus
            </span>
            <span className="rounded bg-[#14120f] border border-[#221f1a] px-1.5 py-0.5 font-mono text-[9px] text-[#a0978c]">
              LSM-Tree
            </span>
          </div>
        </div>

        {/* Bento 5: Instant Guest & Cloud Sync (span 1) */}
        <div className="group relative flex flex-col justify-between rounded-xl border border-[#201d18] bg-[#11100e] p-4 transition-all duration-200 hover:border-[#332e26] hover:bg-[#14120f]">
          <div>
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-[#2a2620] bg-[#161411] text-accent">
              <Cloud className="h-4 w-4" />
            </div>
            <h3 className="mb-1 font-serif text-sm font-semibold text-[#e4ddd3] group-hover:text-white transition-colors">
              Zero signup wall
            </h3>
            <p className="mb-3 text-[11px] leading-relaxed text-[#8a8178]">
              Start building right now as a guest with instant local storage saving, or sign in to sync.
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded border border-[#1e1c18] bg-[#090807] p-2 text-[10px] text-[#a0978c]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Instant Access • 100% Free</span>
          </div>
        </div>
      </div>
    </section>
  );
}
