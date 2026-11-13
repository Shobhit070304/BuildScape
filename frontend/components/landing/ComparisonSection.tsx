import { X, Check, Sparkles } from "lucide-react";

interface CompareRowProps {
  bad: string;
  good: string;
}

function CompareRow({ bad, good }: CompareRowProps) {
  return (
    <div className="grid grid-cols-1 border-b border-white/[0.08] transition-colors hover:bg-white/[0.02] md:grid-cols-2">
      {/* Old Way */}
      <div className="flex items-center gap-3.5 p-4 sm:p-5">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-950/40 border border-rose-800/40 text-rose-400">
          <X className="h-3 w-3" />
        </div>
        <span className="text-xs sm:text-sm text-neutral-400">{bad}</span>
      </div>

      {/* BuildScape Way */}
      <div className="flex items-center gap-3.5 border-t border-white/[0.08] bg-[#0E0E14] p-4 sm:p-5 md:border-l md:border-t-0">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 shadow-xs shadow-emerald-500/20">
          <Check className="h-3 w-3" />
        </div>
        <span className="text-xs sm:text-sm font-semibold text-white">{good}</span>
      </div>
    </div>
  );
}

export function ComparisonSection() {
  const comparisons = [
    {
      bad: "Binge-watching videos while your code editor sits empty",
      good: "You write every line of code locally across 8 structured milestones",
    },
    {
      bad: "Copy-pasting snippets you can't explain in technical interviews",
      good: "Deep mental models, system sequence diagrams, and architecture trade-offs",
    },
    {
      bad: "App stays trapped on localhost and is forgotten a week later",
      good: "Every project ends with a live production URL & verifiable GitHub repository",
    },
    {
      bad: "Getting stuck when versions mismatch or packages fail to install",
      good: "Pinned dependencies, strict types, and verified CLI commands that just work",
    },
    {
      bad: "Building generic toy apps (counters, to-do lists, fake calculators)",
      good: "Building real systems (pgx Go REST APIs, Spring Boot microservices, FastAPI AI)",
    },
    {
      bad: "No feedback loop — guessing if your code is production-ready",
      good: "Automated checkpoint tests verify each phase before you advance",
    },
  ];

  return (
    <section id="comparison" className="mb-20 sm:mb-28 lg:mb-32 scroll-mt-24">
      {/* Section Header */}
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex">
          <span className="pill-mono">
            <Sparkles className="h-3 w-3 text-white" />
            <span>THE REAL DIFFERENCE</span>
          </span>
        </div>
        <h2 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
          Tutorial Hell vs. The BuildScape Standard
        </h2>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-neutral-400">
          Traditional tutorials give you passive syntax to memorize. BuildScape gives you production engineering judgment you own.
        </p>
      </div>

      {/* Comparison Table Card */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0E] shadow-2xl shadow-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        {/* Table Header */}
        <div className="grid grid-cols-1 border-b border-white/[0.08] bg-[#060608] text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 md:grid-cols-2">
          <div className="p-4 px-6 text-rose-400/90 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500/80 inline-block" />
            The Tutorial Hell Trap
          </div>
          <div className="border-t border-white/[0.08] p-4 px-6 text-white md:border-l md:border-t-0 bg-[#0E0E14] flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            The BuildScape Engineering Standard
          </div>
        </div>

        {/* Rows */}
        {comparisons.map((c, i) => (
          <CompareRow key={i} bad={c.bad} good={c.good} />
        ))}
      </div>
    </section>
  );
}
