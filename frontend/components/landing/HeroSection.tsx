"use client";

import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Database,
  Code2,
  Server,
} from "lucide-react";
import { TechIcon } from "@/components/TechBadge";

export function HeroSection() {

  return (
    <section
      id="hero"
      className="relative min-h-[calc(100vh-3.5rem)] w-full overflow-hidden flex flex-col justify-center items-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08]"
    >
      {/* ── Atmospheric Full-Screen Radial Ambient Glow & Grid ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Strong Primary Violet / Indigo Core Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[1200px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.20),rgba(147,51,234,0.12)_35%,rgba(56,189,248,0.06)_60%,transparent_75%)] blur-[100px] animate-pulse-slow" />
        {/* Secondary Titanium Ambient Bloom */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[850px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),rgba(129,140,248,0.15)_45%,transparent_70%)] blur-[80px]" />
        {/* Precision Background Dot Grid with Mask */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.09)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_45%,#000_65%,transparent_100%)] opacity-80" />
      </div>

      {/* ── MAIN CONTENT CONTAINER FLANKED BY SIDE GRAPHICS ── */}
      <div className="relative z-10 mx-auto w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        {/* ───────────────── LEFT SIDE GRAPHICS CLUSTER (IMAGE 5) ───────────────── */}
        <div className="hidden lg:flex flex-col gap-4 w-72 shrink-0 select-none animate-float-slow">
          {/* Terminal Code Verification Card */}
          <div className="rounded-2xl border border-white/10 bg-[#0A0A0E]/90 p-4 shadow-2xl shadow-black/80 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-2.5">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-rose-500/80" />
                <div className="h-2 w-2 rounded-full bg-amber-500/80" />
                <div className="h-2 w-2 rounded-full bg-emerald-500/80" />
                <span className="font-mono text-[10px] text-neutral-400 ml-1.5">buildscape-cli</span>
              </div>
              <span className="font-mono text-[9px] text-emerald-400">PASSED</span>
            </div>
            <div className="font-mono text-[11px] text-neutral-300 space-y-1">
              <p className="text-neutral-500">$ buildscape verify</p>
              <p className="text-emerald-400 flex items-center gap-1">
                <span>✓</span> Phase 3 architecture validated
              </p>
              <p className="text-emerald-400 flex items-center gap-1">
                <span>✓</span> 14/14 milestone checks OK
              </p>
              <p className="text-neutral-400 text-[10px] pt-1">
                [0.08s] Memory: 18.2 MB · 0 leaks
              </p>
            </div>
          </div>

          {/* Floating Technology Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0E0E14] px-3 py-1.5 text-xs font-mono text-neutral-300 shadow-lg">
              <TechIcon name="Go" className="h-3.5 w-3.5" />
              <span>Golang Engine</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0E0E14] px-3 py-1.5 text-xs font-mono text-neutral-300 shadow-lg">
              <Database className="h-3.5 w-3.5 text-indigo-400" />
              <span>PostgreSQL</span>
            </div>
          </div>

          {/* Infrastructure Metrics Sticker */}
          <div className="rounded-xl border border-white/10 bg-[#0A0A0E]/80 p-3 flex items-center justify-between font-mono text-[11px] text-neutral-400 shadow-md">
            <div className="flex items-center gap-2">
              <Server className="h-3.5 w-3.5 text-emerald-400" />
              <span>Docker Container</span>
            </div>
            <span className="text-emerald-400 font-semibold">Active</span>
          </div>
        </div>

        {/* ───────────────── CENTER STUDIO HERO COPY (IMAGE 5) ───────────────── */}
        <div className="flex-1 max-w-3xl flex flex-col items-center text-center mx-auto">
          {/* Eyebrow Pill */}
          <div className="mb-5 inline-flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-950/40 px-3.5 py-1 text-xs font-mono font-semibold text-purple-200 shadow-sm shadow-purple-500/10 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>PRODUCTION ENGINEERING PLATFORM</span>
            </span>
          </div>

          {/* Massive, Crisp H1 Heading */}
          <h1 className="mb-5 font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-white">
            The production blueprints platform{" "}
            <span className="gradient-text-violet">
              that does it all.
            </span>
          </h1>

          {/* Scaled Clean Description */}
          <p className="mb-8 max-w-2xl text-sm sm:text-base leading-relaxed text-neutral-300 font-normal">
            One curriculum for all your systems engineering needs. Quality standards. Painless architecture. Verified milestones &amp; live code checkpoints from scratch.
          </p>

          {/* Action CTAs Cluster */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs sm:text-sm font-bold text-black shadow-xl shadow-white/10 transition-all hover:bg-neutral-200 hover:scale-105 cursor-pointer"
            >
              <span>START BUILDING FREE</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/showcases"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-white/10 cursor-pointer"
            >
              <span>Explore Showcases</span>
            </Link>
          </div>

          {/* Live Status Social Proof Line (Matching Screenshot) */}
          <div className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span className="inline-block h-2 w-2 rounded-xs bg-emerald-400" />
            <span>Accepting new builders · 1,240+ active engineers</span>
          </div>

          {/* Popular Tracks Quick Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 pt-6 border-t border-white/[0.06] w-full">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mr-1">
              Popular Tracks:
            </span>
            {[
              "Web Development",
              "Full-Stack SpringBoot",
              "Golang",
              "Python",
              "React & Node.js",
            ].map((name) => (
              <Link
                key={name}
                href={`/projects?track=${encodeURIComponent(name)}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0E0E14] px-2.5 py-1 text-xs font-medium text-neutral-300 transition-all hover:border-white/20 hover:text-white"
              >
                <TechIcon name={name} className="h-3 w-3 shrink-0" />
                <span>{name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ───────────────── RIGHT SIDE GRAPHICS CLUSTER (IMAGE 5) ───────────────── */}
        <div className="hidden lg:flex flex-col gap-4 w-72 shrink-0 select-none animate-float-slow [animation-delay:3s]">
          {/* Verified Proof of Work Card */}
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-4 shadow-2xl shadow-black/80 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2 mb-2">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-mono text-[10px] font-bold">VERIFIED DELIVERABLE</span>
              </div>
              <span className="font-mono text-[9px] text-emerald-500">#BS-8492</span>
            </div>
            <p className="font-sans text-xs font-bold text-white">Habitly REST API Engine</p>
            <p className="font-mono text-[10px] text-neutral-400 mt-0.5">
              100% Milestones Certified on GitHub
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-emerald-400 pt-2 border-t border-emerald-500/20">
              <span>Proof-of-Work: Valid</span>
              <span>100% Free</span>
            </div>
          </div>

          {/* Floating Technology Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0E0E14] px-3 py-1.5 text-xs font-mono text-neutral-300 shadow-lg">
              <TechIcon name="Python" className="h-3.5 w-3.5" />
              <span>Python 3.12</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0E0E14] px-3 py-1.5 text-xs font-mono text-neutral-300 shadow-lg">
              <TechIcon name="React" className="h-3.5 w-3.5" />
              <span>React 19</span>
            </div>
          </div>

          {/* Live Community Showcase Sticker */}
          <div className="rounded-xl border border-white/10 bg-[#0A0A0E]/80 p-3 flex items-center justify-between font-mono text-[11px] text-neutral-400 shadow-md">
            <div className="flex items-center gap-2">
              <Code2 className="h-3.5 w-3.5 text-purple-400" />
              <span>Real GitHub Repos</span>
            </div>
            <span className="text-white font-semibold">120+ Deployed</span>
          </div>
        </div>
      </div>
    </section>
  );
}
