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
        <span className="text-xs sm:text-sm font-medium text-[#d4cbbd] transition-colors group-hover:text-[#c9a96e]">
          {q}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-[#6b6256] transition-transform duration-200 group-hover:text-[#c9a96e] ${
            open ? "rotate-180 text-[#c9a96e]" : ""
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
      a: "No! You can browse and build immediately as a guest. Your phase progress is automatically saved to your browser's local storage. You can also sign in with Google anytime to sync your progress across devices.",
    },
    {
      q: "What skill level do I need?",
      a: "Projects are clearly tagged across 5 levels: Entry, Basic, Intermediate, Advanced, and Expert. Entry builds only require basic programming knowledge. Intermediate and Advanced builds cover real-world architectures with detailed explanations.",
    },
    {
      q: "Can I put these projects on my resume?",
      a: "Yes! That is the core goal of BuildScape. Every project finishes with a live deployment and a clean GitHub repository that demonstrates real architecture and production code to hiring managers.",
    },
    {
      q: "How long does a project take?",
      a: "Basic projects typically take 8–10 hours across structured phases. Advanced distributed systems take 18–24 hours. Everything is self-paced, so you can build at your own speed.",
    },
    {
      q: "What happens if I get stuck?",
      a: "Every single phase includes explicit terminal commands, directory blueprints, and verification checkpoints so you can confirm your progress before advancing.",
    },
  ];

  return (
    <section id="faq" className="mb-10 sm:mb-12 scroll-mt-20">
      <div className="rounded-xl border border-[#201d18] bg-[#11100e] p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_1.6fr] lg:gap-8">
          {/* Left Title */}
          <div>
            <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-amber-800/40 bg-amber-950/30 px-2.5 py-0.5">
              <HelpCircle className="h-3 w-3 text-[#c9a96e]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9a96e]">
                FAQ
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#e4ddd3] mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs leading-relaxed text-[#8a8178]">
              Everything you need to know about the platform, projects, and learning workflow.
            </p>

            <div className="mt-4">
              <Link
                href="/projects"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#c9a96e] hover:text-[#d4b577] transition-colors"
              >
                <span>Browse All Projects</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Right Accordion List */}
          <div className="rounded-lg border border-[#201d18] bg-[#14120f] p-3 sm:p-4 divide-y divide-[#201d18]">
            {faqs.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
