interface CompareRowProps {
  bad: string;
  good: string;
}

function CompareRow({ bad, good }: CompareRowProps) {
  return (
    <div className="grid grid-cols-1 border-b border-[#222222] md:grid-cols-2">
      <div className="flex items-center gap-2.5 p-3.5 px-6">
        <span className="shrink-0 text-sm font-bold text-red-500">✗</span>
        <span className="text-[0.8125rem] text-[#8a8178]">{bad}</span>
      </div>
      <div className="flex items-center gap-2.5 border-t border-[#222222] bg-emerald-950/15 p-3.5 px-6 md:border-l md:border-t-0">
        <span className="shrink-0 text-sm font-bold text-[#5a9c6f]">✓</span>
        <span className="text-[0.8125rem] font-medium text-[#c8c0b4]">{good}</span>
      </div>
    </div>
  );
}

export function ComparisonSection() {
  const comparisons = [
    {
      bad: "Copy-paste code you don't understand",
      good: "Type every line with full concept explanation",
    },
    {
      bad: "Finish the tutorial, forget it in a week",
      good: "Build a real project that stays in your portfolio",
    },
    {
      bad: "Stuck the moment you deviate from the video",
      good: "Understand why, not just how",
    },
    {
      bad: "No deployment — localhost only",
      good: "Every project ships to production",
    },
    {
      bad: "No feedback loop — did it work correctly?",
      good: "Phase checkpoints verify your understanding",
    },
    {
      bad: "Random order, random projects",
      good: "Structured phases with logical progression",
    },
  ];

  return (
    <section className="border-t border-[#1a1a1a] py-16">
      <div className="mb-8">
        <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-widest text-[#7a7168]">
          Why not just watch tutorials?
        </p>
        <h2 className="max-w-md font-serif text-2xl font-bold text-[#e4ddd3] sm:text-3xl">
          Tutorial hell is real. Here&apos;s the way out.
        </h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#262626] bg-[#0c0c0c]">
        {/* Header row */}
        <div className="grid grid-cols-1 bg-[#121212] md:grid-cols-2">
          <div className="border-b border-[#262626] p-4 px-6">
            <span className="text-xs font-bold tracking-wider text-red-400">
              TUTORIAL MODE
            </span>
          </div>
          <div className="border-b border-[#262626] bg-emerald-950/25 p-4 px-6 md:border-l">
            <span className="text-xs font-bold tracking-wider text-[#5a9c6f]">
              BUILDSCAPE
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
