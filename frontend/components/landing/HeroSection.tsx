import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Terminal,
  CheckCircle2,
  CircleDot,
  Lock,
  Code2,
  Cpu,
  Layers,
  ShieldCheck,
} from "lucide-react";

export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden py-6 sm:py-8 scroll-mt-20">
      {/* Subtle ambient warm glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 h-[320px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,_#c9a96e,_transparent_65%)] opacity-10 blur-[90px]" />
      </div>

      <div className="relative grid grid-cols-1 items-center gap-7 lg:grid-cols-12 lg:gap-8">
        {/* Left Column: Headline, value proposition, simple language */}
        <div className="lg:col-span-7">
          {/* Eyebrow badge */}
          <div className="mb-3 inline-flex">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-800/40 bg-amber-950/30 px-2.5 py-0.5 text-[11px] font-medium text-[#c9a96e] shadow-xs">
              <Sparkles className="h-3 w-3 text-[#c9a96e]" />
              <span>Project-Based Engineering Platform</span>
            </span>
          </div>

          {/* Main Headline with Serif (Times New Roman / Editorial feel) */}
          <h1 className="mb-3 font-serif text-2xl font-bold leading-tight tracking-tight text-[#e4ddd3] sm:text-3xl lg:text-4xl">
            Build real software.
            <br />
            <span className="italic font-normal text-[#c9a96e]">
              Step by step. Zero fluff.
            </span>
          </h1>

          {/* Subtitle with compact size and simple language */}
          <p className="mb-4 max-w-lg text-xs leading-relaxed text-[#8a8178] sm:text-sm">
            No endless video tutorials or throwaway toy apps. Follow structured blueprints to build, test, and deploy production backends and distributed systems from an empty folder.
          </p>

          {/* Value Props Strip (Compact) */}
          <div className="mb-5 grid grid-cols-3 gap-2 max-w-md">
            <div className="flex items-center gap-1.5 rounded border border-[#221f1a] bg-[#11100e] p-1.5 px-2">
              <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
              <span className="text-[10px] font-medium text-[#d4cbbd]">100% Free</span>
            </div>
            <div className="flex items-center gap-1.5 rounded border border-[#221f1a] bg-[#11100e] p-1.5 px-2">
              <Layers className="h-3 w-3 text-[#c9a96e] shrink-0" />
              <span className="text-[10px] font-medium text-[#d4cbbd]">8-Phase Guides</span>
            </div>
            <div className="flex items-center gap-1.5 rounded border border-[#221f1a] bg-[#11100e] p-1.5 px-2">
              <Cpu className="h-3 w-3 text-sky-400 shrink-0" />
              <span className="text-[10px] font-medium text-[#d4cbbd]">Cloud Deploy</span>
            </div>
          </div>

          {/* CTA Buttons (Smaller, tight) */}
          <div className="mb-5 flex flex-wrap items-center gap-2.5">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 rounded border border-amber-600/50 bg-[#d97706] hover:bg-[#b45309] px-4 py-2 text-xs font-semibold text-stone-950 shadow-xs transition-all active:scale-[0.98]"
            >
              <span>Explore Projects</span>
              <ArrowRight className="h-3 w-3" />
            </Link>

            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-1.5 rounded border border-[#262420] bg-[#14120f] px-3.5 py-2 text-xs font-medium text-[#d4cbbd] transition-all hover:border-[#3a352c] hover:text-white"
            >
              <span>See How It Works</span>
            </Link>
          </div>

          {/* Quick Technology Filter Chips */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] font-mono text-[#6b6256] mr-1 uppercase">TRACKS:</span>
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
                className="rounded border border-[#221f1a] bg-[#11100e] px-2 py-0.5 text-[10px] font-medium text-[#8a8178] transition-all hover:border-[#3a352c] hover:text-[#e4ddd3]"
              >
                {track.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Workspace Mockup Card (Compact, clearly visible) */}
        <div className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-xl border border-[#221f1a] bg-[#0e0d0b] shadow-xl">
            {/* Window title bar */}
            <div className="flex items-center justify-between border-b border-[#201d18] bg-[#13110e] px-3 py-2">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                  <div className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
                  <div className="h-2 w-2 rounded-full bg-[#28ca41]" />
                </div>
                <span className="ml-1.5 font-mono text-[10px] text-[#7a7168]">
                  workspace — phase-3.java
                </span>
              </div>
              <span className="rounded border border-amber-800/40 bg-amber-950/40 px-1.5 py-0.5 text-[9px] font-semibold text-[#c9a96e]">
                Phase 3 of 8
              </span>
            </div>

            {/* Workspace Content */}
            <div className="p-3.5">
              <div className="mb-2.5 flex items-center justify-between border-b border-[#201d18] pb-2">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#c9a96e]">
                    Full-Stack SpringBoot Track
                  </span>
                  <h3 className="font-serif text-xs font-semibold text-[#e4ddd3] mt-0.5">
                    Spring Boot 3 REST API & Platform
                  </h3>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[11px] font-bold text-emerald-400">
                    38% Done
                  </div>
                  <div className="text-[9px] text-[#6b6256]">+350 XP</div>
                </div>
              </div>

              {/* Progress Stepper Mini */}
              <div className="mb-2.5 space-y-1 rounded border border-[#221f1a] bg-[#11100e] p-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  <span className="line-through text-[#6b6256] text-[10px]">
                    Phase 1: Project Setup & Dependencies
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  <span className="line-through text-[#6b6256] text-[10px]">
                    Phase 2: Relational Domain Entities & JPA
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-[#c9a96e] bg-amber-950/30 rounded px-2 py-0.5 border border-amber-800/40 text-[10px]">
                  <CircleDot className="h-3 w-3 text-[#c9a96e] shrink-0 animate-pulse" />
                  <span>Phase 3: Service Layer & Business Validation</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#6b6256] px-2 py-0.5 text-[10px]">
                  <Lock className="h-2.5 w-2.5 shrink-0" />
                  <span>Phase 4: Spring Security 6 & JWT Auth</span>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="rounded border border-[#201d18] bg-[#070605] p-2.5 font-mono text-[10px] leading-relaxed">
                <div className="mb-1 flex items-center justify-between text-[#6b6256]">
                  <span className="flex items-center gap-1 text-[#8a8178]">
                    <Code2 className="h-3 w-3 text-[#c9a96e]" />
                    TaskService.java
                  </span>
                  <Terminal className="h-2.5 w-2.5 text-[#6b6256]" />
                </div>
                <div>
                  <span className="text-[#c9a96e]">@Transactional</span>
                </div>
                <div>
                  <span className="text-amber-400">public</span> TaskResponseDTO{" "}
                  <span className="text-sky-300">createTask</span>(CreateTaskDTO dto) &#123;
                </div>
                <div className="text-[#6b6256]">&nbsp;&nbsp;// Validate business rules and persist</div>
                <div>
                  &nbsp;&nbsp;<span className="text-amber-400">return</span> taskRepository.<span className="text-emerald-400">save</span>(entity);
                </div>
                <div>&#125;</div>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="flex items-center justify-between border-t border-[#201d18] bg-[#13110e] px-3 py-2 text-xs">
              <span className="text-[10px] text-[#7a7168]">
                Estimated time: <strong className="text-[#d4cbbd]">10 hours</strong>
              </span>
              <Link
                href="/projects/springboot-rest-task-manager"
                className="group flex items-center gap-1 text-[10px] font-semibold text-[#c9a96e] transition-colors hover:text-[#d4b577]"
              >
                <span>View Overview</span>
                <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
