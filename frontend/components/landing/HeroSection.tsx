import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Lock,
  Code2,
  Terminal,
  GitBranch,
  Layers,
  Check,
} from "lucide-react";

export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24 mb-10 sm:mb-16 scroll-mt-24">
      {/* Sleek Atmospheric Background Effect: Radial Glow + Precision Dot Grid */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Soft Indigo / Titanium Ambient Radial Gradient */}
        <div className="absolute -top-32 left-1/2 h-[520px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12),rgba(255,255,255,0.05)_40%,transparent_70%)] blur-[90px]" />
        {/* Precision Background Dot Grid with Mask */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,#000_60%,transparent_100%)] opacity-70" />
      </div>

      <div className="relative mx-auto max-w-5xl flex flex-col items-center justify-center text-center">
        {/* Eyebrow Pill */}
        <div className="mb-4 inline-flex">
          <span className="pill-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>BLUEPRINTS FOR SOFTWARE ENGINEERS</span>
          </span>
        </div>

        {/* Scaled H1 Heading */}
        <h1 className="mb-4 font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.12] tracking-tight text-white max-w-3xl">
          Build real systems.{" "}
          <span className="gradient-text-titanium">
            Escape tutorial hell.
          </span>
        </h1>

        {/* Scaled Description */}
        <p className="mb-7 max-w-2xl text-sm sm:text-base leading-relaxed text-neutral-400 font-normal">
          Stop watching video tutorials you forget next week. Follow production blueprints to design, write, test, and deploy real systems from scratch — with complete mental models, verified CLI checkpoints, and portfolio repositories on GitHub.
        </p>

        {/* Key Value Prop Chips — Centered */}
        <div className="mb-7 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {[
            { icon: <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />, label: "100% Free & Open Curriculum" },
            { icon: <Layers className="h-3.5 w-3.5 text-neutral-300 shrink-0" />, label: "8 Structured Phases" },
            { icon: <GitBranch className="h-3.5 w-3.5 text-neutral-300 shrink-0" />, label: "Live GitHub Deliverable" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0C0C10] px-3.5 py-1.5 shadow-sm shadow-black/40"
            >
              {icon}
              <span className="text-xs font-medium text-neutral-200">{label}</span>
            </div>
          ))}
        </div>

        {/* Primary & Secondary Action CTAs — Centered */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link href="/projects" className="btn-primary px-5 py-2.5 text-xs sm:text-sm shadow-lg shadow-white/10">
            <span>Start Building Free</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="#how-it-works" className="btn-secondary px-5 py-2.5 text-xs sm:text-sm">
            How It Works
          </Link>
        </div>

        {/* Popular Tracks Quick Navigation — Centered */}
        <div className="mb-12 flex flex-wrap items-center justify-center gap-2">
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mr-1">
            Popular Tracks:
          </span>
          {[
            "Next.js & TypeScript",
            "Golang",
            "Spring Boot & React",
            "Python & FastAPI",
            "Rust",
          ].map((track) => (
            <Link
              key={track}
              href={`/projects?track=${encodeURIComponent(track)}`}
              className="rounded-lg border border-white/[0.08] bg-[#0E0E14] px-2.5 py-1 text-xs font-medium text-neutral-400 transition-all hover:border-white/25 hover:bg-[#14141C] hover:text-white"
            >
              {track}
            </Link>
          ))}
        </div>

        {/* High-Fidelity Workspace Preview Mockup — Centered Container */}
        <div className="w-full max-w-3xl mx-auto text-left">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0E] shadow-2xl shadow-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
            {/* Window Title Bar */}
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0E0E14] px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ef4444]/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#10b981]/80" />
                </div>
                <span className="ml-2 font-mono text-[11px] text-neutral-400">workspace — streaks.go</span>
              </div>
              <span className="rounded-md border border-white/15 bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] font-semibold text-neutral-200">
                Phase 3 of 8
              </span>
            </div>

            <div className="p-4 sm:p-5">
              {/* Project Title In Mockup */}
              <div className="mb-3.5 flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                    Backend Go Track
                  </span>
                  <h3 className="font-sans text-sm font-bold text-white mt-0.5">
                    Habitly: Habit Tracker REST API
                  </h3>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Checkpoint Active
                  </div>
                  <div className="text-[10px] text-neutral-500">pgx v5 • Dockerized</div>
                </div>
              </div>

              {/* Stepper Checklist */}
              <div className="mb-3.5 space-y-1.5 rounded-xl border border-white/[0.08] bg-[#0E0E14] p-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="line-through text-neutral-500">Phase 1: Chi Router &amp; Graceful Shutdown</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="line-through text-neutral-500">Phase 2: Database Schema &amp; pgx Connection Pool</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/[0.06] px-2 py-1 font-medium text-white shadow-xs">
                  <CircleDot className="h-3.5 w-3.5 shrink-0 text-white animate-pulse" />
                  Phase 3: Streak Calculation Engine &amp; Time Zones
                </div>
                <div className="flex items-center gap-2 px-2 py-0.5 text-neutral-500">
                  <Lock className="h-3 w-3 shrink-0" />
                  Phase 4: JWT Auth, Password Hashing &amp; IDOR Defense
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="rounded-xl border border-white/[0.08] bg-[#060608] p-3.5 font-mono text-[11px] leading-relaxed">
                <div className="mb-2 flex items-center gap-1.5 text-neutral-400">
                  <Code2 className="h-3.5 w-3.5 text-neutral-300" />
                  <span className="text-neutral-200 font-medium">streaks.go</span>
                  <Terminal className="ml-auto h-3 w-3 text-neutral-500" />
                </div>
                <div className="text-neutral-500">&#47;&#47; Compute unbroken daily streaks across user timezone</div>
                <div>
                  <span className="text-indigo-400 font-semibold">func</span>{" "}
                  <span className="text-sky-300">CalculateStreak</span>(logs []CheckIn, tz *time.Location) StreakResult &#123;
                </div>
                <div className="text-neutral-400">
                  &nbsp;&nbsp;current, best := <span className="text-amber-400">0</span>, <span className="text-amber-400">0</span>
                </div>
                <div className="text-neutral-400">
                  &nbsp;&nbsp;<span className="text-indigo-400 font-semibold">return</span> StreakResult&#123;Current: current, Longest: best&#125;
                </div>
                <div>&#125;</div>
              </div>
            </div>

            {/* Mockup Status Bar */}
            <div className="flex items-center justify-between border-t border-white/[0.08] bg-[#0E0E14] px-4 py-2.5 text-xs">
              <span className="text-neutral-400 font-mono text-[11px]">
                Duration: <strong className="text-white">26h total</strong>
              </span>
              <Link
                href="/projects/habitly-go-rest-api"
                className="group flex items-center gap-1 font-semibold text-white transition-opacity hover:opacity-80"
              >
                Inspect Blueprint
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
