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
    { label: "Flagship Blueprints", sub: "Real system architectures", value: 7, suffix: " builds" },
    { label: "Milestone Phases", sub: "Automated checkpoints", value: 56, suffix: " phases" },
    { label: "Engineering Hours", sub: "Zero video fluff", value: 180, suffix: "h+" },
    { label: "Open & Free", sub: "No paywalls or trials", value: 100, suffix: "%" },
  ];

  return (
    <section className="mb-20 sm:mb-28">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map(({ label, sub, value, suffix }) => (
          <div
            key={label}
            className="group relative flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-6 sm:p-7 text-center shadow-2xl shadow-black/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#0E0E14]"
          >
            <div className="mb-1 font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-white group-hover:text-neutral-200 transition-colors">
              <Counter target={value} suffix={suffix} />
            </div>
            <div className="text-xs sm:text-sm font-semibold text-neutral-200">{label}</div>
            <div className="text-[11px] font-mono text-neutral-500 mt-1">{sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
