import { Zap, Lock, Unlock, Trophy } from "lucide-react";

function PhaseCard({
  phase,
  locked,
  xp,
}: {
  phase: string;
  locked?: boolean;
  xp: number;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 px-4 transition-all ${
        locked
          ? "border-[#1c1c1c] bg-[#0a0a0a] opacity-40"
          : "border-amber-700/50 bg-amber-950/25 opacity-100 shadow-sm"
      }`}
    >
      {locked ? (
        <Lock className="h-4 w-4 shrink-0 text-[#4a4540]" />
      ) : (
        <Unlock className="h-4 w-4 shrink-0 text-[#c9a96e]" />
      )}
      <span
        className={`flex-1 text-xs sm:text-[0.8125rem] font-medium ${
          locked ? "text-[#4a4540]" : "text-[#e4ddd3]"
        }`}
      >
        {phase}
      </span>
      {!locked && (
        <span className="font-mono text-xs font-bold text-[#c9a96e]">
          +{xp} XP
        </span>
      )}
    </div>
  );
}

export function GamificationSection() {
  return (
    <section className="mb-16 rounded-2xl border border-[#222222] bg-[#0e0e0e] p-7 sm:p-10 lg:p-12">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Left description */}
        <div>
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-700/35 bg-emerald-950/30 px-3 py-1">
            <Zap className="h-3.5 w-3.5 text-[#5a9c6f]" />
            <span className="text-[0.72rem] font-semibold text-[#5a9c6f]">
              Gamified progress
            </span>
          </div>
          <h2 className="mb-3 font-serif text-2xl font-bold text-[#e4ddd3] sm:text-3xl">
            Unlock phases as you grow
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-[#7a7168]">
            Each project is split into 5 structured phases. Complete a phase, earn XP, and the next one unlocks.
            Your progress is saved locally — pick up exactly where you left off.
          </p>

          <div className="flex gap-8">
            {[
              { value: "150", label: "XP per phase" },
              { value: "5", label: "Phases per project" },
              { value: "∞", label: "Resume anytime" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="font-serif text-2xl font-bold text-[#c9a96e] sm:text-3xl">
                  {value}
                </div>
                <div className="text-[0.7rem] text-[#7a7168]">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Phase Unlock cards */}
        <div className="flex flex-col gap-2.5">
          <PhaseCard phase="Phase 1 — Project Setup & Folder Structure" xp={150} />
          <PhaseCard phase="Phase 2 — Content Layer & Data Modeling" xp={150} />
          <PhaseCard phase="Phase 3 — Routing & Page Layout" xp={150} locked />
          <PhaseCard phase="Phase 4 — Styling & Interactivity" xp={150} locked />
          <PhaseCard phase="Phase 5 — Deployment & Go Live" xp={150} locked />

          <div className="mt-1 flex items-center gap-2.5 rounded-lg border border-dashed border-amber-600/30 bg-amber-950/15 p-3 px-4">
            <Trophy className="h-4 w-4 text-[#c9a96e] shrink-0" />
            <span className="text-xs text-[#a8a09a]">
              Complete all 5 → Earn{" "}
              <strong className="text-[#c9a96e] font-semibold">750 XP</strong> + Project Badge
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
