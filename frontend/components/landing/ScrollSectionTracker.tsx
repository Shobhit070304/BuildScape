"use client";

import { useState, useEffect } from "react";

interface Section {
  id: string;
  name: string;
}

const SECTIONS: Section[] = [
  { id: "hero", name: "Overview" },
  { id: "projects", name: "Featured Builds" },
  { id: "how-it-works", name: "How It Works" },
  { id: "features", name: "Features" },
  { id: "comparison", name: "Comparison" },
  { id: "faq", name: "FAQ" },
];

export function ScrollSectionTracker() {
  const [activeSection, setActiveSection] = useState<string>("hero");

  useEffect(() => {
    const handleScroll = () => {
      // getBoundingClientRect() is reliable across scroll containers and CSS transforms.
      const threshold = window.innerHeight * 0.35;

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= threshold) {
            setActiveSection(SECTIONS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <aside
      className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center select-none pointer-events-auto"
      aria-label="Section navigation tracker"
    >
      <div className="flex flex-col items-center">
        {SECTIONS.map((sec, index) => {
          const isActive = activeSection === sec.id;

          return (
            <div key={sec.id} className="flex flex-col items-center">
              {/* Connector line before (except for first item) */}
              {index > 0 && (
                <div
                  className={`w-[1px] h-6 sm:h-7 transition-colors duration-300 ${
                    isActive ? "bg-purple-500/80" : "bg-zinc-800"
                  }`}
                />
              )}

              {/* Node button */}
              <button
                onClick={() => scrollTo(sec.id)}
                className="group relative flex items-center justify-center p-1 cursor-pointer outline-none transition-transform hover:scale-110"
                aria-label={`Jump to ${sec.name}`}
              >
                {/* Floating label on hover or active */}
                <span
                  className={`pointer-events-none absolute right-6 font-mono text-[9px] tracking-wider whitespace-nowrap rounded px-1.5 py-0.5 border transition-all duration-200 ${
                    isActive
                      ? "opacity-100 translate-x-0 border-purple-800/60 bg-[#161411] text-purple-300 shadow-md"
                      : "opacity-0 translate-x-1 border-[#2a2620] bg-[#12100d] text-zinc-400 group-hover:opacity-100 group-hover:translate-x-0"
                  }`}
                >
                  {sec.name}
                </span>

                {isActive ? (
                  /* Active half-filled purple circle */
                  <svg
                    className="h-3.5 w-3.5 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.7)] animate-pulse"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M12 3a9 9 0 0 1 0 18V3z"
                      fill="currentColor"
                    />
                  </svg>
                ) : (
                  /* Inactive hollow circle */
                  <div className="h-2 w-2 rounded-full border border-zinc-600 bg-[#0a0a0a] transition-all group-hover:border-zinc-400 group-hover:scale-125" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
