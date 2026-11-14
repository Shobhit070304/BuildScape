"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Flame, Zap, Award, Loader2, Calendar } from "lucide-react";
import { api, type UserActivityResponse, type UserActivityDay } from "@/lib/api";

interface ActivityHeatmapProps {
  username: string;
  initialData?: UserActivityResponse;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];

export function ActivityHeatmap({ username, initialData }: ActivityHeatmapProps) {
  const [data, setData] = useState<UserActivityResponse | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(initialData);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .getUserActivity(username)
      .then((res) => {
        if (!cancelled) {
          setData(res);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load activity heatmap");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username, initialData]);

  // Group 365 calendar days into 53 columns (weeks of 7 days)
  const { weeks, monthHeaders } = useMemo(() => {
    if (!data?.calendar || data.calendar.length === 0) {
      return { weeks: [], monthHeaders: [] };
    }

    // Days start from 364 days ago to today.
    // Ensure days align to Monday-Sunday (or Sunday-Saturday).
    const days = [...data.calendar];
    
    // Group into columns of 7
    const resultWeeks: (UserActivityDay | null)[][] = [];
    let currentWeek: (UserActivityDay | null)[] = [];

    // Determine the day of week for the first date
    const firstDate = new Date(`${days[0].date}T00:00:00.000Z`);
    // Sunday is 0, Monday is 1, ..., Saturday is 6
    const firstDayOfWeek = (firstDate.getUTCDay() + 6) % 7; // Monday = 0, Sunday = 6

    // Fill leading empty days in the first week
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }

    days.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        resultWeeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      resultWeeks.push(currentWeek);
    }

    // Compute month headers with starting column index
    const headers: { month: string; colIndex: number }[] = [];
    let lastMonth = -1;

    resultWeeks.forEach((week, colIdx) => {
      const validDay = week.find((d) => d !== null);
      if (validDay) {
        const d = new Date(`${validDay.date}T00:00:00.000Z`);
        const m = d.getUTCMonth();
        if (m !== lastMonth) {
          headers.push({ month: MONTH_NAMES[m], colIndex: colIdx });
          lastMonth = m;
        }
      }
    });

    return { weeks: resultWeeks, monthHeaders: headers };
  }, [data]);

  // Auto-scroll to the right (most recent activity) on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [weeks]);

  const getCellColorClass = (level: number) => {
    switch (level) {
      case 1:
        return "bg-emerald-950/90 border border-emerald-800/40 hover:border-emerald-500/80";
      case 2:
        return "bg-emerald-700/80 border border-emerald-600/50 hover:border-emerald-400";
      case 3:
        return "bg-emerald-500 border border-emerald-400/60 shadow-xs shadow-emerald-500/20 hover:border-white";
      case 4:
        return "bg-emerald-400 border border-emerald-300 shadow-sm shadow-emerald-400/30 hover:border-white";
      default:
        return "bg-white/[0.04] border border-white/[0.03] hover:border-white/20";
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(`${dateStr}T00:00:00.000Z`);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-6 text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-neutral-400">
          <Loader2 className="h-4 w-4 animate-spin text-white" />
          <span>Loading activity graph...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null; // Gracefully degrade if no data
  }

  return (
    <div className="relative rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-5 sm:p-6 shadow-xl">
      {/* Heatmap Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <Calendar className="h-4 w-4 text-emerald-400" />
          <div>
            <h3 className="font-sans text-sm font-bold text-white tracking-tight">
              Building Activity & Streaks
            </h3>
            <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
              {data.totalContributions} milestone{data.totalContributions === 1 ? "" : "s"} completed in the last year
            </p>
          </div>
        </div>

        {/* Streaks Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Current Streak */}
          <div
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono font-medium border transition-colors ${
              data.currentStreak > 0
                ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-300 shadow-xs shadow-emerald-500/10"
                : "border-white/10 bg-white/[0.03] text-neutral-400"
            }`}
          >
            <Flame
              className={`h-3.5 w-3.5 ${
                data.currentStreak > 0 ? "text-amber-400 fill-amber-400" : "text-neutral-500"
              }`}
            />
            <span>
              <strong className="font-bold text-white">{data.currentStreak}</strong> day
              {data.currentStreak === 1 ? "" : "s"} streak
            </span>
          </div>

          {/* Longest Streak */}
          <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-mono text-neutral-300">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>
              <strong className="font-bold text-white">{data.longestStreak}</strong> best record
            </span>
          </div>
        </div>
      </div>

      {/* Grid Container with Horizontal Scroll */}
      <div className="relative overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10" ref={scrollRef}>
        <div className="min-w-[720px] select-none">
          {/* Month labels header */}
          <div className="relative h-5 mb-1.5 ml-7 text-[10px] font-mono text-neutral-500">
            {monthHeaders.map((header, idx) => (
              <span
                key={`${header.month}-${idx}`}
                className="absolute"
                style={{ left: `${header.colIndex * 14}px` }}
              >
                {header.month}
              </span>
            ))}
          </div>

          {/* Heatmap Grid */}
          <div className="flex items-start gap-1">
            {/* Weekday labels */}
            <div className="flex flex-col gap-1 pr-1.5 pt-0.5 text-[9px] font-mono text-neutral-500">
              {DAY_LABELS.map((dayLabel, idx) => (
                <div key={idx} className="h-3 w-5 leading-3 text-right">
                  {dayLabel}
                </div>
              ))}
            </div>

            {/* Columns of 7 days */}
            <div className="flex gap-1">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day, dayIdx) => {
                    if (!day) {
                      return <div key={dayIdx} className="h-3 w-3 rounded-xs opacity-0" />;
                    }

                    return (
                      <div
                        key={day.date}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredDay({
                            date: day.date,
                            count: day.count,
                            x: rect.left + rect.width / 2,
                            y: rect.top - 8,
                          });
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`h-3 w-3 rounded-xs transition-colors duration-150 cursor-pointer ${getCellColorClass(
                          day.level
                        )}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend & Summary Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/[0.05] text-[11px] font-mono text-neutral-500">
        <div className="flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5 text-neutral-400" />
          <span>Real commit & task progression telemetry</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="h-2.5 w-2.5 rounded-xs bg-white/[0.04] border border-white/[0.04]" />
          <div className="h-2.5 w-2.5 rounded-xs bg-emerald-950/90 border border-emerald-800/40" />
          <div className="h-2.5 w-2.5 rounded-xs bg-emerald-700/80 border border-emerald-600/50" />
          <div className="h-2.5 w-2.5 rounded-xs bg-emerald-500 border border-emerald-400/60" />
          <div className="h-2.5 w-2.5 rounded-xs bg-emerald-400 border border-emerald-300" />
          <span>More</span>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full rounded-lg border border-white/15 bg-neutral-900/95 px-3 py-1.5 text-center shadow-2xl backdrop-blur-md"
          style={{ left: `${hoveredDay.x}px`, top: `${hoveredDay.y}px` }}
        >
          <div className="font-sans text-xs font-semibold text-white">
            {hoveredDay.count === 0 ? "No activity" : `${hoveredDay.count} milestone${hoveredDay.count === 1 ? "" : "s"} completed`}
          </div>
          <div className="font-mono text-[10px] text-neutral-400">
            {formatDateDisplay(hoveredDay.date)}
          </div>
        </div>
      )}
    </div>
  );
}
