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
  const totalProjects = projects.length; // 2
  const totalPhases = projects.reduce((acc, p) => acc + p.phases.length, 0); // 10
  const totalHours = projects.reduce((acc, p) => acc + p.estimatedHours, 0); // 20

  const stats = [
    { label: "Full-Stack Projects", value: totalProjects, suffix: "" },
    { label: "Structured Phases", value: totalPhases, suffix: "" },
    { label: "Hours of Building", value: totalHours, suffix: "h" },
    { label: "Free & Self-Paced", value: 100, suffix: "%" },
  ];

  return (
    <section className="mb-16 grid grid-cols-2 gap-4 rounded-2xl border border-[#222222] bg-[#0e0e0e] p-6 sm:p-8 md:grid-cols-4">
      {stats.map(({ label, value, suffix }) => (
        <div key={label} className="text-center">
          <div className="mb-1 font-serif text-3xl font-bold leading-none text-[#e4ddd3] sm:text-4xl">
            <Counter target={value} suffix={suffix} />
          </div>
          <div className="text-xs text-[#7a7168]">{label}</div>
        </div>
      ))}
    </section>
  );
}
