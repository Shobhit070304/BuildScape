"use client";

import { useState, useEffect, useRef } from "react";
import { getAllProjects } from "@/lib/projects";

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const step = Math.max(1, Math.ceil(target / 30));
          let cur = 0;
          const timer = setInterval(() => {
            cur = Math.min(cur + step, target);
            setCount(cur);
            if (cur >= target) clearInterval(timer);
          }, 35);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  const projects = getAllProjects();
  const totalProjects = projects.length;
  const totalPhases = projects.reduce((acc, p) => acc + p.phases.length, 0);
  const totalHours = projects.reduce((acc, p) => acc + p.estimatedHours, 0);

  const stats = [
    { label: "Full-Stack Builds", value: totalProjects, suffix: "" },
    { label: "Step-by-Step Phases", value: totalPhases, suffix: "" },
    { label: "Guided Engineering", value: totalHours, suffix: "h" },
    { label: "Free & Self-Paced", value: 100, suffix: "%" },
  ];

  return (
    <section className="mb-20">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#24211b] bg-[#1d1a16] shadow-xl md:grid-cols-4">
        {stats.map(({ label, value, suffix }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center bg-[#0e0d0b] p-6 text-center transition-colors hover:bg-[#12100d]"
          >
            <div className="mb-1.5 font-serif text-3xl font-bold tracking-tight text-[#f0eae1] sm:text-4xl">
              <Counter target={value} suffix={suffix} />
            </div>
            <div className="text-xs font-medium text-[#8a8178]">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
