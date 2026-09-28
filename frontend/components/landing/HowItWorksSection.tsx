import { BookOpen, Code2, Rocket, CheckCircle2, Lock, Trophy } from "lucide-react";

interface JourneyStepProps {
  number: string;
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  isLast?: boolean;
  accentClass: string;
  tasks: string[];
}

function JourneyStep({
  number,
  icon,
  label,
  title,
  description,
  isLast,
  accentClass,
  tasks,
}: JourneyStepProps) {
  return (
    <div className="relative flex gap-5">
      {/* Connector line */}
      {!isLast && (
        <div
          className="absolute left-[21px] top-12 h-[calc(100%-1rem)] w-0.5 bg-gradient-to-b from-[#2e2820] to-[#141414]"
          aria-hidden="true"
        />
      )}

      {/* Step indicator circle */}
      <div className="relative z-10 shrink-0">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-lg ${accentClass}`}
        >
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 ${isLast ? "pb-0" : "pb-10"}`}>
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#7a7168]">
            {number} · {label}
          </span>
        </div>
        <h3 className="mb-2 font-serif text-lg font-bold text-[#e4ddd3] sm:text-xl">
          {title}
        </h3>
        <p className="mb-3.5 max-w-md text-sm leading-relaxed text-[#7a7168]">
          {description}
        </p>

        {/* Task list */}
        <div className="flex flex-col gap-1.5">
          {tasks.map((task) => (
            <div key={task} className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#5a9c6f]" />
              <span className="text-[0.8rem] text-[#8a8178]">{task}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16">
      <div className="mb-12">
        <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-widest text-[#7a7168]">
          Your learning journey
        </p>
        <h2 className="max-w-md font-serif text-3xl font-bold text-[#e4ddd3] sm:text-4xl">
          Three stages. One real project you actually ship.
        </h2>
      </div>

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left: Journey Steps */}
        <div>
          <JourneyStep
            number="Stage 01"
            label="Choose"
            icon={<BookOpen className="h-5 w-5 text-amber-300" />}
            title="Pick your project"
            description="Browse projects by track, difficulty, and tech stack. Each one is a complete, production-grade build — not a toy counter app."
            accentClass="border-amber-600/40 bg-amber-950/40 text-amber-300"
            tasks={[
              "Filter by Next.js, Node.js, React, Go",
              "See estimated hours + phase count",
              "Read the project overview",
              "Check the tech stack",
            ]}
          />
          <JourneyStep
            number="Stage 02"
            label="Build"
            icon={<Code2 className="h-5 w-5 text-sky-300" />}
            title="Work through phases, unlock XP"
            description="Each project has 5 structured phases. Complete a phase, earn XP, and unlock the next. Every phase teaches you concepts first, then walks you through code — step by step."
            accentClass="border-sky-600/40 bg-sky-950/40 text-sky-300"
            tasks={[
              "Read the concept explanation",
              "Follow step-by-step instructions",
              "Type the code yourself",
              "Run the checkpoint checklist",
              "Mark phase complete → earn XP",
            ]}
          />
          <JourneyStep
            number="Stage 03"
            label="Ship"
            icon={<Rocket className="h-5 w-5 text-emerald-300" />}
            title="Deploy and own it"
            description="Every project ends with a deployment phase. Push to GitHub, deploy to Vercel or Render, and walk away with a live project you understand end-to-end."
            isLast
            accentClass="border-emerald-600/40 bg-emerald-950/40 text-emerald-300"
            tasks={[
              "Push your code to GitHub",
              "Deploy to production",
              "Write a README that explains your architecture",
              "Add it to your portfolio",
            ]}
          />
        </div>

        {/* Right: Mockup Preview */}
        <div className="top-20 lg:sticky">
          <div className="overflow-hidden rounded-2xl border border-[#222222] bg-[#0c0c0c] shadow-2xl">
            {/* Window titlebar */}
            <div className="flex items-center gap-1.5 border-b border-[#1a1a1a] bg-[#111111] px-4 py-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#28ca41]" />
              <span className="ml-2 font-mono text-[0.7rem] text-[#4a4540]">
                buildscape — markdown-blog-nextjs
              </span>
            </div>

            <div className="grid grid-cols-[10.5rem_1fr]">
              {/* Mockup sidebar */}
              <div className="border-r border-[#1a1a1a] bg-[#0d0d0d] p-3">
                <div className="mb-1 text-[0.6rem] uppercase tracking-wider text-[#4a4540]">
                  NEXT.JS
                </div>
                <div className="mb-2 text-[0.72rem] font-semibold text-[#c8c0b4]">
                  Markdown Blog
                </div>
                <div className="mb-1 flex justify-between text-[0.6rem] text-[#4a4540]">
                  <span>Progress</span>
                  <span>2/5</span>
                </div>
                <div className="mb-3 h-1 w-full rounded-full bg-[#1e1e1e]">
                  <div className="h-full w-2/5 rounded-full bg-amber-700" />
                </div>
                {[
                  { t: "1. Project Setup", done: true },
                  { t: "2. Content Layer", done: true },
                  { t: "3. Blog Routing", done: false, active: true },
                  { t: "4. Markdown Render", done: false, locked: true },
                  { t: "5. Deploy to Vercel", done: false, locked: true },
                ].map(({ t, done, active, locked }) => (
                  <div
                    key={t}
                    className={`mb-1 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[0.65rem] ${
                      active
                        ? "border border-amber-800/40 bg-amber-950/30 text-[#d4b577] font-medium"
                        : "border border-transparent"
                    } ${locked ? "opacity-35 text-[#4a4540]" : done ? "text-[#7a7168]" : ""}`}
                  >
                    {done ? (
                      <CheckCircle2 className="h-3 w-3 text-[#5a9c6f] shrink-0" />
                    ) : locked ? (
                      <Lock className="h-3 w-3 text-[#4a4540] shrink-0" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-amber-700 flex items-center justify-center font-mono text-[0.55rem] text-[#c9a96e] shrink-0">
                        3
                      </div>
                    )}
                    <span className="truncate">{t}</span>
                  </div>
                ))}
              </div>

              {/* Mockup content */}
              <div className="p-4 text-[0.7rem] leading-relaxed text-[#7a7168]">
                <div className="mb-1.5 font-mono text-[#c9a96e] font-semibold">
                  # Phase 3 — Blog Layout & Routing
                </div>
                <div className="mb-2 text-[#a8a09a] font-medium">
                  ## Core Concepts: Server Components
                </div>
                <div className="mb-3 text-[#8a8178]">
                  By default, every page in Next.js App Router is a Server Component rendered on the server with zero client JS overhead...
                </div>
                <div className="rounded border border-[#1a1a1a] bg-[#070707] p-2.5 font-mono text-[0.62rem] leading-relaxed text-[#7fa867]">
                  <div className="text-[#4a4540]">// app/page.tsx</div>
                  <div>
                    <span className="text-[#c9a96e]">export default function</span>{" "}
                    <span className="text-[#9da8c8]">HomePage</span>() &#123;
                  </div>
                  <div>
                    &nbsp;&nbsp;<span className="text-[#c9a96e]">const</span> posts ={" "}
                    <span className="text-[#9da8c8]">getAllPosts</span>();
                  </div>
                  <div>
                    &nbsp;&nbsp;<span className="text-[#c9a96e]">return</span>{" "}
                    <span className="text-[#6a6560]">&lt;ul&gt;</span>...
                  </div>
                  <div>&#125;</div>
                </div>
              </div>
            </div>

            {/* Mockup footer */}
            <div className="flex items-center justify-between border-t border-[#1a1a1a] bg-[#111111] px-4 py-2 text-xs">
              <span className="font-mono text-[0.65rem] text-[#4a4540]">
                ← Phase 2
              </span>
              <div className="flex items-center gap-1">
                {[true, true, false, false, false].map((active, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full ${
                      active
                        ? "w-1 bg-[#5a9c6f]"
                        : i === 2
                        ? "w-3 bg-[#c9a96e]"
                        : "w-1 bg-[#1e1e1e]"
                    }`}
                  />
                ))}
              </div>
              <span className="rounded border border-amber-800/40 bg-amber-950/30 px-2.5 py-0.5 text-[0.65rem] font-medium text-[#c9a96e]">
                Phase 4 →
              </span>
            </div>
          </div>

          {/* XP Banner below mockup */}
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-700/25 bg-amber-950/20 p-3.5 px-4 shadow-md">
            <Trophy className="h-4.5 w-4.5 text-[#c9a96e] shrink-0" />
            <div>
              <div className="text-xs font-semibold text-[#c9a96e]">
                Phase Complete! +150 XP
              </div>
              <div className="text-[0.7rem] text-[#7a7168]">
                2 of 5 phases done · Level 2 Builder
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
