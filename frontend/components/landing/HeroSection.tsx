import Link from "next/link";
import { ArrowRight, Check, Code2, Layers, ShieldCheck, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section id="hero" className="relative mb-10 overflow-hidden py-16 text-center scroll-mt-24 sm:mb-16 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,#c9a96e,transparent_62%)] opacity-[0.12] blur-[100px]" />
        <div className="hero-grid absolute inset-x-0 top-0 h-[36rem] opacity-30" />
      </div>
      <div className="relative mx-auto max-w-4xl">
        <span className="pill-amber"><Sparkles className="h-3 w-3" />A clearer path from idea to implementation</span>
        <h1 className="mx-auto mt-6 max-w-4xl font-serif text-4xl font-semibold leading-[1.02] tracking-tight text-text sm:text-6xl lg:text-7xl">
          Build with intent.
          <span className="mt-2 block font-normal italic text-accent">Know how every layer works.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-text-muted sm:text-base">
          Follow production-minded project guides with the architecture, commands, and code laid out phase by phase. Learn by building a complete system you can explain.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/projects" className="btn-primary px-5! py-3! text-sm!">Explore projects <ArrowRight className="h-4 w-4" /></Link>
          <Link href="#how-it-works" className="btn-secondary px-5! py-3! text-sm!">How it works</Link>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-medium text-text-faint">
          <span className="inline-flex items-center gap-2"><Layers className="h-3.5 w-3.5 text-accent" />Phase-based curriculum</span>
          <span className="inline-flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-accent" />Progress saved to your account</span>
        </div>
        <div className="hero-console mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface-card text-left shadow-2xl shadow-black/20 sm:mt-14">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2"><Code2 className="h-3.5 w-3.5 text-accent" /><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">Build sequence</span></div>
            <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-text-faint">From brief to working system</span>
          </div>
          <div className="grid gap-0 sm:grid-cols-3">
            {[
              ["01", "Map the system", "Model data, boundaries, and failure paths"],
              ["02", "Build a slice", "Create the files, wire the behavior, run it"],
              ["03", "Prove it works", "Verify the flow and carry it into the next phase"],
            ].map(([number, title, body], index) => (
              <div key={number} className={`px-4 py-4 sm:px-5 sm:py-5 ${index ? "border-t border-border sm:border-l sm:border-t-0" : ""}`}>
                <div className="mb-3 flex items-center justify-between"><span className="font-mono text-[10px] text-accent">{number}</span>{index === 2 && <Check className="h-3.5 w-3.5 text-accent" />}</div>
                <h2 className="font-serif text-base font-semibold text-text">{title}</h2>
                <p className="mt-1.5 text-xs leading-relaxed text-text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
