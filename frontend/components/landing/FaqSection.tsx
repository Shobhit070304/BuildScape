"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

interface FAQItemProps {
  q: string;
  a: string;
}

function FAQItem({ q, a }: FAQItemProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#1a1a1a]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-[0.9375rem] font-medium text-[#c8c0b4] transition-colors hover:text-[#e4ddd3]">
          {q}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#7a7168] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed text-[#7a7168]">{a}</p>
      )}
    </div>
  );
}

export function FaqSection() {
  const faqs = [
    {
      q: "Is BuildScape completely free?",
      a: "Yes — all projects and phases are fully free, forever. No paywall, no sign-up required. Your progress is saved in your browser's localStorage.",
    },
    {
      q: "Do I need to log in or create an account?",
      a: "No. Your progress is stored locally in your browser. If you clear your browser data, your progress will reset, but the content is always here.",
    },
    {
      q: "What skill level do I need?",
      a: "Projects are tagged Beginner, Intermediate, or Advanced. Beginner projects assume you know basic JavaScript. Intermediate projects assume familiarity with Node.js and APIs. Every concept is explained — you're never left googling.",
    },
    {
      q: "How long does each project take?",
      a: "Beginner projects are 6–8 hours across 5 phases (1–2 hours per phase). Intermediate projects are 10–12 hours. You can stop and resume anytime.",
    },
    {
      q: "Can I use the projects in my portfolio?",
      a: "Absolutely. The whole point is to ship something real. Every project ends with a deployment phase and walks you through writing a README.",
    },
    {
      q: "What makes this different from YouTube or Udemy?",
      a: "You write every line yourself. Concepts are explained before code. Each phase has a checkpoint checklist. Projects always deploy to production. And you're never passively watching — you're actively building.",
    },
  ];

  return (
    <section id="faq" className="border-t border-[#171717] py-16">
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_1.5fr]">
        <div className="top-20 lg:sticky">
          <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-widest text-[#7a7168]">
            FAQ
          </p>
          <h2 className="mb-3 font-serif text-3xl font-bold text-[#e4ddd3]">
            Common questions
          </h2>
          <p className="text-sm leading-relaxed text-[#7a7168]">
            Still unsure? Browse the projects for free — no account needed.
          </p>
          <Link
            href="/projects"
            className="mt-5 inline-flex items-center gap-1.5 text-sm text-[#c9a96e] transition-colors hover:text-[#d4b577]"
          >
            See all projects <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div>
          {faqs.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
