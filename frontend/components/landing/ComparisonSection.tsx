import { X, Check, Sparkles } from "lucide-react";

interface CompareRowProps {
  bad: string;
  good: string;
}

function CompareRow({ bad, good }: CompareRowProps) {
  return (
    <div className="grid grid-cols-1 border-b border-[#201d18] transition-colors hover:bg-[#14120f] md:grid-cols-2">
      {/* Old Way */}
      <div className="flex items-center gap-2.5 p-3 px-4">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-950/40 border border-rose-900/50 text-rose-400">
          <X className="h-3 w-3" />
        </div>
        <span className="text-xs text-[#8a8178]">{bad}</span>
      </div>

      {/* BuildScape Way */}
      <div className="flex items-center gap-2.5 border-t border-[#201d18] bg-emerald-950/10 p-3 px-4 md:border-l md:border-t-0">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
          <Check className="h-3 w-3" />
        </div>
        <span className="text-xs font-medium text-[#d4cbbd]">{good}</span>
      </div>
    </div>
  );
}

export function ComparisonSection() {
  const comparisons = [
    {
      bad: "Copy-pasting video code you don't really understand",
      good: "Clear mental models and diagrams before writing code",
    },
    {
      bad: "App stays trapped on localhost and is forgotten next week",
      good: "Every project ends with a live production URL & GitHub repo",
    },
    {
      bad: "Getting stuck when versions mismatch or packages fail",
      good: "Pinned dependencies and tested CLI commands that just work",
    },
    {
      bad: "Building generic toy apps (counters, to-do lists)",
      good: "Building real systems (Kafka microservices, Raft, WebRTC)",
    },
    {
      bad: "No feedback loop — guessing if your code is correct",
      good: "Strict checkpoint tests verify each phase before moving on",
    },
  ];

  return (
    <section id="comparison" className="mb-20 sm:mb-28 lg:mb-32 scroll-mt-24">
      {/* Section Header */}
      <div className="mb-6 text-center">
        <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-amber-800/40 bg-amber-950/30 px-2.5 py-0.5">
          <Sparkles className="h-3 w-3 text-accent" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
            The Difference
          </span>
        </div>
        <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#e4ddd3] mb-1">
          Escape tutorial hell. Build true competence.
        </h2>
        <p className="mx-auto max-w-md text-xs leading-relaxed text-[#8a8178]">
          Watching someone else code does not build muscle memory. Doing it yourself step-by-step does.
        </p>
      </div>

      {/* Comparison Grid Table (Compact) */}
      <div className="overflow-hidden rounded-xl border border-[#201d18] bg-[#11100e] shadow-sm">
        {/* Header row */}
        <div className="grid grid-cols-1 bg-[#14120f] md:grid-cols-2 border-b border-[#201d18]">
          <div className="p-2.5 px-4 border-b border-[#201d18] md:border-b-0">
            <span className="font-mono text-[11px] font-bold tracking-wider text-rose-400 uppercase flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              Typical Video Tutorials
            </span>
          </div>
          <div className="bg-emerald-950/20 p-2.5 px-4 md:border-l border-[#201d18]">
            <span className="font-mono text-[11px] font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              The BuildScape Method
            </span>
          </div>
        </div>

        {comparisons.map((c) => (
          <CompareRow key={c.bad} bad={c.bad} good={c.good} />
        ))}
      </div>
    </section>
  );
}
