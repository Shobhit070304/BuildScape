import {
  Code2,
  Terminal,
  Cloud,
  Sparkles,
  Activity,
} from "lucide-react";

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-24 border-b border-white/[0.08] scroll-mt-24">
      {/* Section Header */}
      <div className="mb-14 text-center">
        <div className="mb-2.5 inline-flex">
          <span className="pill-mono">
            <Sparkles className="h-3 w-3 text-white" />
            <span>ENGINEERING RIGOR</span>
          </span>
        </div>
        <h2 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
          Architected for developers who take engineering seriously.
        </h2>
        <p className="mx-auto max-w-lg text-xs sm:text-sm leading-relaxed text-neutral-400">
          No toy to-do apps or pseudo-code snippets. Every project covers production telemetry, real database transactions, concurrency safety, and live containerization.
        </p>
      </div>

      {/* Advanced Bento Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Bento 1: Wide Card (col-span-2) - Architecture First */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-6 sm:p-7 md:col-span-2 transition-all duration-300 hover:border-white/20 hover:bg-[#0E0E14] shadow-xl shadow-black/70 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white">
              <Code2 className="h-5 w-5" />
            </div>
            <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              Architecture First
            </span>
          </div>

          <h3 className="mb-2 font-sans text-lg sm:text-xl font-bold text-white">
            Understand the system mechanics before writing code
          </h3>
          <p className="mb-5 max-w-xl text-xs sm:text-sm leading-relaxed text-neutral-400">
            Every phase starts with mental models, schema diagrams, and architectural decisions. Learn why entities are partitioned, how transactions lock safely, and why specific patterns beat common alternatives.
          </p>

          {/* Micro Interactive Architecture Flow Preview */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.08] bg-[#060608] p-3 text-xs font-mono text-neutral-300">
            <span className="rounded bg-white/[0.06] border border-white/10 px-2.5 py-1 text-white font-semibold">
              Client Request
            </span>
            <span className="text-neutral-600">➔</span>
            <span className="rounded bg-white/[0.06] border border-white/10 px-2.5 py-1 text-neutral-200 font-semibold">
              Chi Rate Limiter &amp; JWT
            </span>
            <span className="text-neutral-600">➔</span>
            <span className="rounded bg-white/[0.06] border border-white/10 px-2.5 py-1 text-neutral-200 font-semibold">
              Domain Service (Isolated)
            </span>
            <span className="text-neutral-600">➔</span>
            <span className="rounded bg-white/[0.06] border border-white/10 px-2.5 py-1 text-emerald-400 font-semibold">
              PostgreSQL + pgx Pool
            </span>
          </div>
        </div>

        {/* Bento 2: Standard Card (col-span-1) - Concurrency & Telemetry */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-6 sm:p-7 transition-all duration-300 hover:border-white/20 hover:bg-[#0E0E14] shadow-xl shadow-black/70 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white">
              <Activity className="h-5 w-5" />
            </div>
            <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
              Telemetry
            </span>
          </div>

          <h3 className="mb-2 font-sans text-base sm:text-lg font-bold text-white">
            High-Throughput Concurrency
          </h3>
          <p className="mb-4 text-xs leading-relaxed text-neutral-400">
            Benchmarked under load. Race detection, thread pools, and non-blocking I/O routines tested with zero deadlocks.
          </p>

          {/* Telemetry Micro Sparkline Graph */}
          <div className="rounded-xl border border-white/[0.08] bg-[#060608] p-3 font-mono text-[10px]">
            <div className="flex items-center justify-between text-neutral-500 mb-1.5">
              <span>LATENCY P99</span>
              <span className="text-emerald-400 font-bold">1.4ms AVG</span>
            </div>
            <svg className="h-7 w-full overflow-visible" viewBox="0 0 160 28" fill="none">
              <path
                d="M0,22 Q20,18 40,8 T80,14 T120,5 T160,3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-white"
              />
            </svg>
          </div>
        </div>

        {/* Bento 3: Standard Card (col-span-1) - CLI & Deterministic Tests */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-6 sm:p-7 transition-all duration-300 hover:border-white/20 hover:bg-[#0E0E14] shadow-xl shadow-black/70 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white">
              <Terminal className="h-5 w-5" />
            </div>
            <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
              Deterministic
            </span>
          </div>

          <h3 className="mb-2 font-sans text-base sm:text-lg font-bold text-white">
            Tested CLI &amp; Assertions
          </h3>
          <p className="mb-4 text-xs leading-relaxed text-neutral-400">
            No broken packages or missing arguments. Every shell command is pinned and verified against modern container runtimes.
          </p>

          <div className="rounded-xl border border-white/[0.08] bg-[#060608] p-3 font-mono text-[11px] text-emerald-400">
            $ docker compose up -d postgres redis<br />
            <span className="text-neutral-500">✔ Container db-1 Healthy (5432)</span>
          </div>
        </div>

        {/* Bento 4: Wide Card (col-span-2) - Production Cloud Delivery */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-6 sm:p-7 md:col-span-2 transition-all duration-300 hover:border-white/20 hover:bg-[#0E0E14] shadow-xl shadow-black/70 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white">
              <Cloud className="h-5 w-5" />
            </div>
            <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              Deployment Ready
            </span>
          </div>

          <h3 className="mb-2 font-sans text-lg sm:text-xl font-bold text-white">
            Live containerized deployments on actual cloud hosts
          </h3>
          <p className="mb-5 max-w-xl text-xs sm:text-sm leading-relaxed text-neutral-400">
            Finish every build with multi-stage scratch Docker builds, CORS hardening, automated CI pipelines, and public URLs you can hand to hiring teams.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs text-neutral-300">
            <div className="rounded-lg border border-white/[0.08] bg-[#060608] p-2.5">
              <div className="text-[10px] text-neutral-500 uppercase">IMAGE FOOTPRINT</div>
              <div className="text-white font-bold mt-0.5">14.2 MB Alpine</div>
            </div>
            <div className="rounded-lg border border-white/[0.08] bg-[#060608] p-2.5">
              <div className="text-[10px] text-neutral-500 uppercase">HEALTH CHECK</div>
              <div className="text-emerald-400 font-bold mt-0.5">/v1/healthz 200</div>
            </div>
            <div className="rounded-lg border border-white/[0.08] bg-[#060608] p-2.5 col-span-2 sm:col-span-1">
              <div className="text-[10px] text-neutral-500 uppercase">SSL &amp; DNS</div>
              <div className="text-white font-bold mt-0.5">TLS 1.3 Certified</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
