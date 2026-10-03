import Link from "next/link";
import { Compass, Code2, Rocket, CheckCircle2, Lock, Zap } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: <Compass className="h-4 w-4 text-accent" />,
    title: "Pick Your Project",
    body: "Choose from high-demand tracks like Spring Boot, Go, Rust, or Next.js. Inspect the full system architecture before writing a single line.",
    bullets: [
      "Industry-grade architectures (Kafka, Raft)",
      "Exact prerequisites & time estimates",
      "Pinned library versions to eliminate errors",
    ],
    bulletColor: "bg-[#c9a96e]",
    highlight: false,
  },
  {
    step: "02",
    icon: <Code2 className="h-4 w-4 text-accent" />,
    title: "Build Phase-by-Phase",
    body: "Each project is split into 6–8 focused phases. You learn the mental model first, then write clean, production-grade code.",
    bullets: [
      "Sidebar roadmap with continuous tracking",
      "Every command & directory structure provided",
      "Strict verification checkpoints for each phase",
    ],
    bulletColor: "bg-[#c9a96e]",
    highlight: true,
    badge: "Core Workflow",
  },
  {
    step: "03",
    icon: <Rocket className="h-4 w-4 text-emerald-400" />,
    title: "Deploy & Showcase",
    body: "Every project concludes with Docker packaging and cloud deployment. Push to GitHub and showcase live software on your resume.",
    bullets: [
      "Live production URL with real HTTPS",
      "Impressive GitHub repo to show in interviews",
      "Proof of engineering competence you can explain",
    ],
    bulletColor: "bg-emerald-400",
    highlight: false,
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="mb-20 sm:mb-28 lg:mb-32 scroll-mt-24">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex">
          <span className="pill-amber">
            <Zap className="h-2.5 w-2.5" />
            The Learning Method
          </span>
        </div>
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-text sm:text-3xl mb-2">
          Three steps. One real system you ship.
        </h2>
        <p className="mx-auto max-w-md text-[0.8125rem] leading-relaxed text-text-muted">
          No passive video watching — architectural blueprints, clear code steps, and checkpoints
          so you build real engineering muscle memory.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-5">
        {STEPS.map((s) => (
          <div
            key={s.step}
            className={`group flex flex-col justify-between rounded-2xl p-5 transition-all duration-200 ${
              s.highlight
                ? "border border-amber-700/50 bg-[#131210] hover:border-amber-600/70 shadow-lg shadow-amber-950/10"
                : "border border-border bg-surface-card hover:border-border-hover hover:bg-[#141413]"
            }`}
          >
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                  s.highlight ? "border-amber-700/50 bg-amber-950/40" : "border-border-subtle bg-[#161615]"
                }`}>
                  {s.icon}
                </div>
                {s.badge ? (
                  <span className="rounded border border-amber-800/40 bg-amber-950/50 px-2 py-0.5 font-mono text-[9px] font-bold text-accent">
                    {s.badge.toUpperCase()}
                  </span>
                ) : (
                  <span className="font-mono text-[10px] font-bold text-[#3a3830]">STEP {s.step}</span>
                )}
              </div>
              <h3 className="mb-2 font-serif text-[1.0625rem] font-semibold text-text group-hover:text-white transition-colors">
                {s.title}
              </h3>
              <p className="mb-4 text-xs leading-relaxed text-text-muted">{s.body}</p>
            </div>
            <ul className="space-y-1.5 border-t border-border pt-3 text-[10px] text-text-muted">
              {s.bullets.map((b) => (
                <li key={b} className="flex items-center gap-1.5">
                  <span className={`h-1 w-1 shrink-0 rounded-full ${s.bulletColor}`} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Phase progression demo */}
      <div className="rounded-2xl border border-border bg-surface-card px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
              Roadmap Experience
            </span>
            <h4 className="font-serif text-sm font-semibold text-text mt-0.5">
              Unlock phases, track progress, and celebrate milestones
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-md border border-emerald-900/60 bg-emerald-950/30 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> Phase 1 ✓
            </div>
            <div className="flex items-center gap-1 rounded-md border border-emerald-900/60 bg-emerald-950/30 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> Phase 2 ✓
            </div>
            <div className="flex items-center gap-1 rounded-md border border-amber-800/60 bg-amber-950/50 px-2.5 py-1 text-[10px] font-semibold text-accent animate-pulse">
              <Zap className="h-3 w-3" /> Phase 3 (Active)
            </div>
            <div className="flex items-center gap-1 rounded-md border border-border bg-[#141413] px-2.5 py-1 text-[10px] text-text-faint">
              <Lock className="h-2.5 w-2.5" /> Phase 4
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
