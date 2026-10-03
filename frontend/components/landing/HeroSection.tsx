import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  CircleDot,
  Lock,
  Code2,
  Cpu,
  Layers,
  ShieldCheck,
  Terminal,
} from "lucide-react";

export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 mb-8 sm:mb-12 scroll-mt-24">
      {/* Ambient radial glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 left-1/2 h-90 w-150 -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,#c9a96e,transparent_60%)] opacity-[0.07] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
        {/* Left: Headline */}
        <div className="w-full">
          {/* Eyebrow */}
          <div className="mb-4 inline-flex">
            <span className="pill-amber">
              <Sparkles className="h-2.5 w-2.5" />
              Project-Based Engineering Platform
            </span>
          </div>

          <h1 className="mb-4 font-serif text-3xl font-semibold leading-[1.15] tracking-tight text-text sm:text-4xl lg:text-5xl">
            Build real software.
            <br />
            <span className="italic font-normal text-accent">
              Step by step. Zero fluff.
            </span>
          </h1>

          <p className="mb-6 max-w-lg text-[0.9rem] leading-relaxed text-[#9a9187]">
            No endless video tutorials or throwaway toy apps. Follow structured blueprints to
            build, test, and deploy production backends and distributed systems from scratch.
          </p>

          {/* Value props */}
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { icon: <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />, label: "100% Free" },
              { icon: <Layers className="h-3 w-3 text-accent shrink-0" />, label: "8-Phase Guides" },
              { icon: <Cpu className="h-3 w-3 text-sky-400 shrink-0" />, label: "Cloud Deploy" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 rounded-md border border-border bg-surface-card px-3 py-1.5">
                {icon}
                <span className="text-[11px] font-medium text-[#d4cbbd]">{label}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Link href="/projects" className="btn-primary">
              <span>Explore Projects</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="#how-it-works" className="btn-secondary">
              How It Works
            </Link>
          </div>

          {/* Track chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono text-[#5a5450] uppercase tracking-widest mr-1">Tracks:</span>
            {[
              { name: "Spring Boot", href: "/projects?track=Full-Stack+SpringBoot" },
              { name: "Golang", href: "/projects?track=Golang" },
              { name: "Rust", href: "/projects?track=Rust" },
              { name: "Next.js", href: "/projects?track=Next.js" },
              { name: "Python", href: "/projects?track=Python" },
            ].map((track) => (
              <Link
                key={track.name}
                href={track.href}
                className="rounded-md border border-border bg-surface-card px-2.5 py-1 text-[11px] font-medium text-[#8a8178] transition-all hover:border-[#333330] hover:text-text"
              >
                {track.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Workspace mockup */}
        <div className="w-full">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-[#0c0c0b] shadow-2xl shadow-black/60">
            {/* Title bar */}
            <div className="flex items-center justify-between border-b border-border bg-surface-card px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#28ca41]" />
                </div>
                <span className="ml-2 font-mono text-[10px] text-[#5a5450]">workspace — phase-3.java</span>
              </div>
              <span className="rounded border border-amber-800/40 bg-amber-950/40 px-2 py-0.5 text-[9px] font-semibold text-accent">
                Phase 3 of 8
              </span>
            </div>

            <div className="p-4">
              <div className="mb-3 flex items-center justify-between border-b border-border pb-2.5">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-accent">
                    Full-Stack SpringBoot Track
                  </span>
                  <h3 className="font-serif text-sm font-semibold text-text mt-0.5">
                    Spring Boot 3 REST API & Platform
                  </h3>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[11px] font-bold text-emerald-400">38% Done</div>
                  <div className="text-[9px] text-[#5a5450]">+350 XP</div>
                </div>
              </div>

              {/* Phase stepper */}
              <div className="mb-3 space-y-1.5 rounded-lg border border-border bg-[#0a0a09] p-2.5 text-[10px]">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  <span className="line-through text-text-faint">Phase 1: Project Setup & Dependencies</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  <span className="line-through text-text-faint">Phase 2: Relational Domain Entities & JPA</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-md border border-amber-800/40 bg-amber-950/30 px-2 py-1 font-medium text-accent">
                  <CircleDot className="h-3 w-3 shrink-0 animate-pulse" />
                  Phase 3: Service Layer & Business Validation
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 text-text-faint">
                  <Lock className="h-2.5 w-2.5 shrink-0" />
                  Phase 4: Spring Security 6 & JWT Auth
                </div>
              </div>

              {/* Code snippet */}
              <div className="rounded-lg border border-border bg-[#060605] p-3 font-mono text-[10px] leading-relaxed">
                <div className="mb-2 flex items-center gap-1.5 text-[#5a5450]">
                  <Code2 className="h-3 w-3 text-accent" />
                  <span className="text-[#8a8178]">TaskService.java</span>
                  <Terminal className="ml-auto h-2.5 w-2.5" />
                </div>
                <div><span className="text-accent">@Transactional</span></div>
                <div>
                  <span className="text-amber-400">public</span> TaskResponseDTO{" "}
                  <span className="text-sky-300">createTask</span>(CreateTaskDTO dto) &#123;
                </div>
                <div className="text-text-faint">&nbsp;&nbsp;// Validate business rules and persist</div>
                <div>
                  &nbsp;&nbsp;<span className="text-amber-400">return</span> taskRepository.<span className="text-emerald-400">save</span>(entity);
                </div>
                <div>&#125;</div>
              </div>
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between border-t border-border bg-surface-card px-4 py-2 text-[10px]">
              <span className="text-[#5a5450]">
                Estimated: <strong className="text-[#d4cbbd]">10 hours</strong>
              </span>
              <Link
                href="/projects/spring-react-secure-task-manager"
                className="group flex items-center gap-1 font-semibold text-accent transition-colors hover:text-accent-hover"
              >
                View Overview
                <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
