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
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left group"
      >
        <span className="text-sm font-medium text-[#d4cbbd] transition-colors group-hover:text-amber-300 sm:text-[0.9375rem]">
          {q}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#7a7168] transition-transform duration-200 group-hover:text-[#c9a96e] ${
            open ? "rotate-180 text-[#c9a96e]" : ""
          }`}
        />
      </button>
      {open && (
        <p className="pb-4 text-xs leading-relaxed text-[#8a8178] sm:text-sm animate-fadeIn">
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
      a: "Yes — all project curricula and phase walkthroughs are 100% free and open. No paywalls, no trial periods, and no credit card required.",
    },
    {
      q: "Do I need to create an account or sign in?",
      a: "No account is required to start building! You can explore and build immediately as a guest, and your progress is saved to your browser's localStorage. You can also sign in with Google anytime to sync your enrollments and track your progress in your personal profile across devices.",
    },
    {
      q: "What skill level do I need to begin?",
      a: "Projects are clearly tagged as Beginner, Intermediate, or Advanced. Beginner projects only require basic JavaScript / HTML familiarity. Intermediate projects cover backend architectures, database schemas, and JWT authentication. Every concept is thoroughly explained.",
    },
    {
      q: "How long does each project take to complete?",
      a: "Beginner builds typically take 6–8 hours across 5 structured phases (approx. 1–2 hours per phase). Intermediate builds take 10–14 hours. All learning is self-paced so you can start, pause, and resume anytime.",
    },
    {
      q: "Can I use these projects in my portfolio or resume?",
      a: "Absolutely! The primary mission of BuildScape is to give you production-ready, full-stack software you truly understand and can proudly showcase on GitHub and in developer interviews.",
    },
    {
      q: "How is BuildScape different from watching YouTube tutorials?",
      a: "BuildScape enforces active engineering. Instead of passively following a video, you read conceptual mental models, type clean code step-by-step, verify your progress through checkpoints, and deploy the application live to the web.",
    },
  ];

  return (
    <section id="faq" className="mb-24 scroll-mt-20">
      <div className="rounded-2xl border border-[#24211b] bg-[#0e0d0b] p-6 sm:p-10 lg:p-12 shadow-xl">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-14">
          {/* Left Title */}
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-800/30 bg-amber-950/25 px-3 py-1">
              <HelpCircle className="h-3.5 w-3.5 text-[#c9a96e]" />
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-[#d4b577]">
                Frequently Asked Questions
              </span>
            </div>
            <h2 className="mb-3 font-serif text-3xl font-bold tracking-tight text-[#f0eae1]">
              Questions & Answers
            </h2>
            <p className="text-xs leading-relaxed text-[#8a8178] sm:text-sm">
              Everything you need to know about the platform, projects, and learning workflow.
            </p>
            <Link
              href="/projects"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#c9a96e] transition-colors hover:text-[#d4b577]"
            >
              <span>Explore all projects</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Right Accordion List */}
          <div className="rounded-xl border border-[#1e1c18] bg-[#12100d] p-4 sm:p-6 divide-y divide-[#1e1c18]">
            {faqs.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
