import { X, Check } from "lucide-react";

interface CompareRowProps {
  bad: string;
  good: string;
}

function CompareRow({ bad, good }: CompareRowProps) {
  return (
    <div className="grid grid-cols-1 border-b border-[#201d18] transition-colors hover:bg-[#12100d] md:grid-cols-2">
      <div className="flex items-center gap-3 p-4 px-6">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-950/40 border border-red-900/40 text-red-400">
          <X className="h-3 w-3" />
        </div>
        <span className="text-xs sm:text-sm text-[#8a8178]">{bad}</span>
      </div>
      <div className="flex items-center gap-3 border-t border-[#201d18] bg-emerald-950/10 p-4 px-6 md:border-l md:border-t-0">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-950/50 border border-emerald-800/50 text-emerald-400">
          <Check className="h-3 w-3" />
        </div>
        <span className="text-xs sm:text-sm font-medium text-[#d4cbbd]">{good}</span>
      </div>
    </div>
  );
}

export function ComparisonSection() {
  const comparisons = [
    {
      bad: "Copy-pasting video code you don't really understand",
      good: "Deep mental models explained before writing a single line of code",
    },
    {
      bad: "Finish the tutorial, forget the concepts next week",
      good: "Build a production system you actually own and understand deeply",
    },
    {
      bad: "Get stuck the second your dependencies or versions mismatch",
      good: "Exact verified commands, pinned packages, and step-by-step guidance",
    },
    {
      bad: "No deployment — app stays trapped on localhost forever",
      good: "Every project ends with a live production URL & GitHub repository",
    },
    {
      bad: "No feedback loop — guessing if your code is production-ready",
      good: "Phase checklists verify each step before advancing to the next",
    },
    {
      bad: "Scattered, disconnected toy apps (to-do lists, counters)",
      good: "Structured 5-phase curricula building production-grade SaaS",
    },
  ];

  return (
    <section className="mb-24">
      <div className="mb-10 text-center">
        <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wider text-[#7a7168]">
          The Reality of Learning
        </p>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-[#f0eae1] sm:text-4xl">
          Tutorial hell is real. Here is the way out.
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-xs text-[#8a8178] sm:text-sm">
          Watching someone else code doesn&apos;t build muscle memory. Doing it yourself does.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#24211b] bg-[#0e0d0b] shadow-xl">
        {/* Header row */}
        <div className="grid grid-cols-1 bg-[#14120f] md:grid-cols-2 border-b border-[#24211b]">
          <div className="p-4 px-6 border-b border-[#24211b] md:border-b-0">
            <span className="text-xs font-bold tracking-wider text-red-400/90 uppercase">
              ✕ Typical Video Tutorials
            </span>
          </div>
          <div className="bg-emerald-950/20 p-4 px-6 md:border-l border-[#24211b]">
            <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
              ✓ The BuildScape Method
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
