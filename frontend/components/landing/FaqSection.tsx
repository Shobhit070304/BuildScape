"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItemProps {
  q: string;
  a: string;
}

function FAQItem({ q, a }: FAQItemProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.08] transition-colors last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 sm:py-5 text-left group"
        aria-expanded={open}
      >
        <span className="text-sm sm:text-base font-semibold text-white transition-colors group-hover:text-neutral-200">
          {q}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200 group-hover:text-white ${
            open ? "rotate-180 text-white" : ""
          }`}
        />
      </button>
      {open && (
        <p className="pb-5 text-xs sm:text-sm leading-relaxed text-neutral-400">
          {a}
        </p>
      )}
    </div>
  );
}

export function FaqSection() {
  const faqs = [
    {
      q: "Is BuildScape completely free?",
      a: "Yes — all project roadmaps and phase walkthroughs are 100% free and open. No paywalls, trial periods, or credit card required.",
    },
    {
      q: "Do I need to sign up to start building?",
      a: "You can browse all project overviews and curricula freely. To enter the interactive step-by-step workspace and save your phase completions, sign in with Google in one click to persist your progress directly to the database.",
    },
    {
      q: "What skill level do I need?",
      a: "Projects are tagged as Beginner, Intermediate, or Advanced. Each project page explains the exact prerequisites and concepts covered before you start.",
    },
    {
      q: "Can I put these projects on my resume?",
      a: "Yes! That is the core goal of BuildScape. Every project finishes with a live deployment and a clean GitHub repository that demonstrates real architecture and production code to hiring managers.",
    },
    {
      q: "How long does a project take?",
      a: "Project time estimates vary by build (typically between 10 to 28 hours across 8 phases). Everything is self-paced, so you can build at your own speed.",
    },
  ];

  return (
    <section id="faq" className="mb-20 sm:mb-28 lg:mb-32 scroll-mt-24">
      {/* Header — Centered & Scaled */}
      <div className="mb-10 text-center">
        <div className="mb-2.5 inline-flex">
          <span className="pill-mono">
            <HelpCircle className="h-3 w-3 text-white" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </span>
        </div>
        <h2 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
          Everything you need to know
        </h2>
        <p className="mx-auto max-w-md text-xs sm:text-sm leading-relaxed text-neutral-400">
          Common questions about the curriculum, learning format, and portfolio deliverables.
        </p>
      </div>

      {/* Accordion Card */}
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-6 sm:p-8 shadow-2xl shadow-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        {faqs.map((f, i) => (
          <FAQItem key={i} q={f.q} a={f.a} />
        ))}
      </div>
    </section>
  );
}
