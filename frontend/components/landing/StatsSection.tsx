"use client";

import { useState, useEffect, useRef } from "react";

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
  const stats = [
    { label: "Production Builds", sub: "Engineered from scratch", value: 19, suffix: "+" },
    { label: "Step-by-Step Phases", sub: "With strict checkpoints", value: 152, suffix: "+" },
    { label: "Curriculum Blueprints", sub: "Architecture roadmaps", value: 1200, suffix: "h" },
    { label: "Free Forever", sub: "Zero paywalls or trials", value: 100, suffix: "%" },
  ];

  return (
    <section className="mb-20 sm:mb-28 lg:mb-32">
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {stats.map(({ label, sub, value, suffix }) => (
          <div
            key={label}
            className="group relative flex flex-col items-center justify-center rounded-xl border border-[#201d18] bg-[#11100e] p-3.5 sm:p-4 text-center shadow-sm transition-all duration-200 hover:border-[#332e26] hover:bg-[#14120f]"
          >
            <div className="mb-0.5 font-mono text-xl font-bold tracking-tight text-[#e4ddd3] sm:text-2xl group-hover:text-accent transition-colors">
              <Counter target={value} suffix={suffix} />
            </div>
            <div className="text-[11px] font-semibold text-[#d4cbbd]">{label}</div>
            <div className="text-[9px] text-[#6b6256] mt-0.5">{sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
