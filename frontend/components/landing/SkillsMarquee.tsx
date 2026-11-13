"use client";

import { TechIcon } from "@/components/TechBadge";

const SKILLS = [
  { name: "Golang", label: "Go 1.24 Systems" },
  { name: "TypeScript", label: "TypeScript & Next.js" },
  { name: "Python", label: "Python & FastAPI" },
  { name: "React", label: "React 19 Architecture" },
  { name: "Spring Boot", label: "Spring Boot 3.5" },
  { name: "PostgreSQL", label: "PostgreSQL & pgx" },
  { name: "Docker", label: "Docker & Compose" },
  { name: "Redis", label: "Redis Caching" },
  { name: "Rust", label: "Rust Concurrency" },
];

export function SkillsMarquee() {
  // Double list to create seamless infinite scroll loop
  const duplicated = [...SKILLS, ...SKILLS];

  return (
    <div className="relative w-full border-b border-white/[0.06] py-5 overflow-hidden select-none">
      {/* Gradient fade masks on left and right edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#050507] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#050507] to-transparent z-10" />

      <div className="flex items-center">
        <div className="animate-marquee flex items-center gap-20 sm:gap-28 px-6">
          {duplicated.map((item, idx) => (
            <div
              key={`${item.name}-${idx}`}
              className="group flex items-center gap-3 text-xs font-mono text-neutral-400 transition-all hover:text-white cursor-pointer py-1"
            >
              <TechIcon name={item.name} className="h-4 w-4 shrink-0 transition-transform group-hover:scale-115 opacity-80 group-hover:opacity-100" />
              <span className="tracking-tight whitespace-nowrap font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
