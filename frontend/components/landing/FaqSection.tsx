"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, HelpCircle } from "lucide-react";

interface FAQItemProps {
  q: string;
  a: string;
}

function FAQItem({ q, a }: FAQItemProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#201d18] transition-colors last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 py-3 text-left group"
        aria-expanded={open}
      >
        <span className="text-xs sm:text-sm font-medium text-[#d4cbbd] transition-colors group-hover:text-accent">
          {q}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-[#6b6256] transition-transform duration-200 group-hover:text-accent ${
            open ? "rotate-180 text-accent" : ""
          }`}
        />
      </button>
      {open && (
        <p className="pb-3 text-xs leading-relaxed text-[#8a8178]">
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
      a: "Projects use three difficulty levels: Beginner, Intermediate, and Expert. Each level includes phase-by-phase guidance and a clear estimate of the work involved.",
    },
    {
      q: "Can I put these projects on my resume?",
      a: "Yes! That is the core goal of BuildScape. Every project finishes with a live deployment and a clean GitHub repository that demonstrates real architecture and production code to hiring managers.",
    },
    {
      q: "How long does a project take?",
      a: "Project duration depends on its scope and estimated hours. Work at your own pace and continue from the last phase you completed.",
    },
    {
      q: "What happens if I get stuck?",
      a: "Every single phase includes explicit terminal commands, directory blueprints, and verification checkpoints so you can confirm your progress before advancing.",
    },
  ];

  return (
    <section id="faq" className="mb-20 sm:mb-28 lg:mb-32 scroll-mt-24">
      <div className="rounded-xl border border-[#201d18] bg-[#11100e] p-4 sm:p-6 shadow-sm">
        <div className="mx-auto max-w-4xl">
          {/* Left Title */}
          <div className="mx-auto mb-6 max-w-xl text-center">
            <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-amber-800/40 bg-amber-950/30 px-2.5 py-0.5">
              <HelpCircle className="h-3 w-3 text-accent" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                FAQ
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#e4ddd3] mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs leading-relaxed text-[#8a8178]">
              Everything you need to know about the platform, projects, and learning workflow.
            </p>

            <div className="mt-4 flex justify-center">
              <Link
                href="/projects"
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
              >
                <span>Browse All Projects</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Right Accordion List */}
          <div className="mx-auto max-w-3xl rounded-lg border border-[#201d18] bg-[#14120f] p-3 sm:p-4 divide-y divide-[#201d18]">
            {faqs.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
