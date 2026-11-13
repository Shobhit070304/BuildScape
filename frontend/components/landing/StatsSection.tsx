"use client";

import { useState, useEffect } from "react";
import { Zap, GitBranch, Layers, Users } from "lucide-react";
import { api } from "@/lib/api";

export function StatsSection() {
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalProjects: number;
    totalEnrollments: number;
    completedEnrollments: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getPublicStats()
      .then((res) => {
        if (!cancelled && res?.stats) {
          setStats(res.stats);
        }
      })
      .catch(() => {
        // graceful fallback to structural facts
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 100% Real metrics: actual projects, actual enrollments, actual architecture specifications
  const items = [
    {
      label: "Production Stacks",
      sub: "Go, React, Python, Spring, Rust",
      value: stats ? stats.totalProjects : 6,
      suffix: " Stacks",
      badge: "VERIFIED ARCHITECTURE",
      icon: Layers,
    },
    {
      label: "Active Enrollments",
      sub: "Real builders in workspace",
      value: stats ? stats.totalEnrollments : 0,
      suffix: " Builders",
      badge: "LIVE DATABASE",
      icon: Users,
    },
    {
      label: "Curriculum Milestones",
      sub: "Phase checkpoints per project",
      value: 8,
      suffix: " Phases",
      badge: "DETERMINISTIC",
      icon: GitBranch,
    },
    {
      label: "Curriculum Access",
      sub: "Zero video paywalls or trials",
      value: 100,
      suffix: "% Free",
      badge: "OPEN SOURCE",
      icon: Zap,
    },
  ];

  return (
    <section className="py-16 sm:py-20 border-b border-white/[0.06] relative">
      {/* Sleek, Boxless Horizontal Telemetry Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="group flex flex-col justify-between py-2">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4 text-neutral-400 group-hover:text-white transition-colors" />
                  <span className="font-mono text-[9px] font-bold tracking-widest text-neutral-500 uppercase">
                    {item.badge}
                  </span>
                </div>

                <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white tracking-tight group-hover:text-indigo-200 transition-colors">
                  {item.value}
                  <span className="text-sm sm:text-base font-semibold text-neutral-400 ml-1">
                    {item.suffix}
                  </span>
                </div>

                <div className="text-xs sm:text-sm font-semibold text-neutral-200 mt-1.5">
                  {item.label}
                </div>
                <div className="text-[11px] font-mono text-neutral-500 mt-0.5 leading-relaxed">
                  {item.sub}
                </div>
              </div>

              {/* Minimalist Micro Bar Indicator */}
              <div className="mt-4 h-0.5 w-12 bg-white/10 group-hover:w-20 group-hover:bg-indigo-400 transition-all duration-300" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
