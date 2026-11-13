import { Compass, Code2, Rocket, CheckCircle2, Zap } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: <Compass className="h-5 w-5 text-white" />,
    title: "Select Your Architecture",
    body: "Choose from high-demand production tracks like Go REST APIs, Rust Systems, Spring Boot Microservices, or Next.js App Router. Review the architecture diagrams before touching code.",
    bullets: [
      "Production-grade stacks (pgx, Chi, Zod, Docker)",
      "Pinned library versions to eliminate dependency drift",
      "Explicit architectural trade-offs & mental models",
    ],
    highlight: false,
  },
  {
    step: "02",
    icon: <Code2 className="h-5 w-5 text-white" />,
    title: "Build Locally With Checkpoints",
    body: "Follow 8 structured phases. Write the code in your own editor, work through granular tasks, and verify each milestone with strict test assertions.",
    bullets: [
      "Task-by-task execution roadmap with zero fluff",
      "Automated checkpoint tests to verify your code",
      "Context-scoped AI assistant if you hit blockers",
    ],
    highlight: true,
    badge: "Core Workflow",
  },
  {
    step: "03",
    icon: <Rocket className="h-5 w-5 text-emerald-400" />,
    title: "Ship to GitHub & Deploy",
    body: "Every project concludes with multi-stage Docker packaging and cloud deployment. Push your completed repository to GitHub to prove your engineering ability.",
    bullets: [
      "Live production deployment URL",
      "Clean GitHub repository with green test runs",
      "Real technical depth you can defend in interviews",
    ],
    highlight: false,
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="mb-20 sm:mb-28 lg:mb-32 scroll-mt-24">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-3 inline-flex">
          <span className="pill-mono">
            <Zap className="h-3 w-3 text-white" />
            <span>THE LEARNING ENGINE</span>
          </span>
        </div>
        <h2 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
          Curriculum, not a code dump.
        </h2>
        <p className="mx-auto max-w-xl text-sm sm:text-base leading-relaxed text-neutral-400">
          You write every line of code locally. Step by step, with deep mental models, task checkpoints, and a verifiable production deployment.
        </p>
      </div>

      {/* 3 Step Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {STEPS.map((s) => (
          <div
            key={s.step}
            className={`relative flex flex-col justify-between rounded-2xl border p-7 transition-all duration-200 hover:-translate-y-1 ${
              s.highlight
                ? "border-white/20 bg-[#0F0F16] shadow-2xl shadow-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]"
                : "border-white/[0.08] bg-[#0A0A0E] hover:border-white/20 shadow-xl shadow-black/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
            }`}
          >
            {s.badge && (
              <span className="absolute -top-3 right-6 rounded-full border border-white/20 bg-white px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-black shadow-md">
                {s.badge}
              </span>
            )}

            <div>
              {/* Step number + Icon */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] shadow-xs">
                  {s.icon}
                </div>
                <span className="font-mono text-3xl font-extrabold text-neutral-600">
                  {s.step}
                </span>
              </div>

              <h3 className="mb-2 font-sans text-lg font-bold text-white">
                {s.title}
              </h3>
              <p className="mb-6 text-xs sm:text-sm leading-relaxed text-neutral-400">
                {s.body}
              </p>

              {/* Bullet points */}
              <ul className="space-y-2.5 border-t border-white/[0.08] pt-5">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-xs text-neutral-300">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-white mt-0.5" />
                    <span className="leading-snug">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
