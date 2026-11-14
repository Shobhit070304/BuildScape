"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Compass, Layers, Sparkles } from "lucide-react";
import { TechIcon } from "@/components/TechBadge";
import { TRACKS_DATA } from "@/lib/tracks";

interface TrackSidebarRailProps {
  selectedTrack?: string | null;
  onSelectTrack?: (track: string | null) => void;
}

export function TrackSidebarRail({
  selectedTrack,
  onSelectTrack,
}: TrackSidebarRailProps) {
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const tracks = Object.values(TRACKS_DATA);

  // Determine active track from URL (/tracks/[slug]) or props
  const pathTrackSlug = pathname?.startsWith("/tracks/")
    ? pathname.split("/")[2]?.toLowerCase()
    : null;
  const isAllProjectsActive = pathname === "/projects" && !selectedTrack;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Track Navigation Sidebar"
      className={`hidden xl:flex fixed left-0 top-14 bottom-0 z-40 flex-col border-r border-white/8 bg-[#07070A]/95 backdrop-blur-2xl shadow-[4px_0_24px_rgba(0,0,0,0.6)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
        isHovered ? "w-64 bg-[#0A0A0F]/98 shadow-black/90" : "w-16"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center gap-3 px-3.5 py-4 border-b border-white/6 overflow-hidden">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Layers className="h-4.5 w-4.5" />
        </div>
        <div
          className={`flex items-center justify-between flex-1 min-w-0 transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <span className="font-mono text-xs uppercase tracking-wider font-semibold text-neutral-200">
            System Tracks
          </span>
          <span className="text-[10px] font-mono rounded-full bg-indigo-500/15 border border-indigo-500/25 px-2 py-0.5 text-indigo-300 font-medium">
            {tracks.length} Tracks
          </span>
        </div>
      </div>

      {/* "All Projects" Action Button */}
      <div className="p-2 border-b border-white/5">
        <Link
          href="/projects"
          onClick={() => {
            if (onSelectTrack) onSelectTrack(null);
          }}
          className={`relative group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all overflow-hidden ${
            isAllProjectsActive
              ? "bg-white/10 text-white border border-white/15 shadow-xs"
              : "text-neutral-400 hover:text-white hover:bg-white/4 border border-transparent"
          }`}
        >
          {isAllProjectsActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
          )}

          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
              isAllProjectsActive
                ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-300"
                : "bg-white/4 text-neutral-400 group-hover:text-white group-hover:bg-white/8"
            }`}
          >
            <Compass className="h-4 w-4" />
          </div>

          <div
            className={`flex flex-col min-w-0 transition-opacity duration-200 ${
              isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <span className="font-sans font-semibold text-xs text-white truncate">
              All Projects
            </span>
            <span className="font-mono text-[10px] text-neutral-400 truncate">
              Full Catalog
            </span>
          </div>
        </Link>
      </div>

      {/* Dedicated Tracks Navigation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
        {tracks.map((t) => {
          const isTrackActive =
            pathTrackSlug === t.slug.toLowerCase() ||
            selectedTrack?.toLowerCase() === t.slug.toLowerCase();

          return (
            <div key={t.slug} className="relative group/track">
              <Link
                href={`/tracks/${t.slug}`}
                onClick={() => {
                  if (onSelectTrack) onSelectTrack(t.slug);
                }}
                className={`relative flex w-full items-center gap-3 rounded-xl p-2 text-left transition-all cursor-pointer overflow-hidden ${
                  isTrackActive
                    ? "bg-linear-to-r from-indigo-500/15 via-indigo-500/5 to-transparent text-white border border-indigo-500/25 shadow-xs"
                    : "text-neutral-400 hover:text-white hover:bg-white/4 border border-transparent"
                }`}
              >
                {/* Active Glowing Left Pill */}
                {isTrackActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.9)]" />
                )}

                {/* Tech Icon Container */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
                    isTrackActive
                      ? "bg-indigo-500/20 border border-indigo-500/30 text-white"
                      : "bg-white/4 border border-white/5 text-neutral-300 group-hover/track:bg-white/8 group-hover/track:text-white"
                  }`}
                >
                  <TechIcon name={t.name} className="h-4 w-4 shrink-0" />
                </div>

                {/* Text Content visible on hover expansion */}
                <div
                  className={`flex items-center justify-between flex-1 min-w-0 transition-opacity duration-200 ${
                    isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="flex flex-col truncate pr-1">
                    <span className="font-sans font-semibold text-xs text-neutral-200 group-hover/track:text-white truncate">
                      {t.name}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-400 group-hover/track:text-neutral-300 truncate">
                      Dedicated Track
                    </span>
                  </div>

                  <ArrowRight className="h-3.5 w-3.5 text-neutral-400 transition-all group-hover/track:translate-x-0.5 group-hover/track:text-white shrink-0" />
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Tip */}
      <div
        className={`p-3 border-t border-white/6 bg-black/20 transition-opacity duration-200 ${
          isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-1.5 text-indigo-400 font-mono text-[10px] font-semibold">
          <Sparkles className="h-3 w-3 shrink-0" />
          <span>Architecture Curriculums</span>
        </div>
        <p className="text-[10px] text-neutral-400 mt-1 leading-snug">
          Click any track to view its dedicated phase roadmap.
        </p>
      </div>
    </aside>
  );
}
