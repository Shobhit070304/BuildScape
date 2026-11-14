"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, ArrowRight, Layers } from "lucide-react";
import { TechIcon } from "@/components/TechBadge";
import { TRACKS_DATA } from "@/lib/tracks";
import { useAuth } from "@/context/AuthContext";

interface TrackSidebarRailProps {
  selectedTrack: string | null;
  onSelectTrack: (track: string | null) => void;
  showSavedOnly?: boolean;
  onToggleSaved?: (val: boolean) => void;
}

export function TrackSidebarRail({
  selectedTrack,
  onSelectTrack,
  showSavedOnly = false,
  onToggleSaved,
}: TrackSidebarRailProps) {
  const { savedProjects } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const tracks = Object.values(TRACKS_DATA);

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`hidden xl:flex fixed left-4 top-28 z-40 flex-col rounded-2xl border border-white/[0.08] bg-[#0A0A0E]/90 p-2 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out ${
        isHovered ? "w-56 bg-[#0E0E14]/95 shadow-black/80" : "w-13"
      }`}
    >
      {/* Rail Header */}
      <div className="flex items-center gap-2.5 px-2 py-2 mb-1 border-b border-white/[0.06] overflow-hidden">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
          <Layers className="h-3.5 w-3.5" />
        </div>
        <div
          className={`font-mono text-[10px] uppercase tracking-wider text-neutral-400 whitespace-nowrap transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          Track Rail
        </div>
      </div>

      {/* "All Tracks" button */}
      <button
        type="button"
        onClick={() => {
          if (onToggleSaved) onToggleSaved(false);
          onSelectTrack(null);
        }}
        className={`group/btn flex items-center gap-3 rounded-xl p-2 text-left transition-colors cursor-pointer overflow-hidden ${
          !selectedTrack && !showSavedOnly
            ? "bg-white/[0.08] text-white"
            : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
        }`}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-xs font-mono font-bold">
          *
        </div>
        <div
          className={`font-mono text-xs whitespace-nowrap transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          All Tracks
        </div>
      </button>

      {/* Tracks List */}
      <div className="my-1.5 space-y-1">
        {tracks.map((t) => {
          const isActive = selectedTrack?.toLowerCase() === t.name.toLowerCase() && !showSavedOnly;

          return (
            <div key={t.slug} className="relative group/track">
              <button
                type="button"
                onClick={() => {
                  if (onToggleSaved) onToggleSaved(false);
                  onSelectTrack(isActive ? null : t.name);
                }}
                className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors cursor-pointer overflow-hidden ${
                  isActive
                    ? "bg-white/[0.1] text-white shadow-xs"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.03]">
                  <TechIcon name={t.name} className="h-4 w-4 shrink-0" />
                </div>
                <div
                  className={`flex items-center justify-between flex-1 min-w-0 transition-opacity duration-200 ${
                    isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <span className="font-mono text-xs truncate">{t.name}</span>
                  <Link
                    href={`/tracks/${t.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    title={`Open ${t.name} dedicated page`}
                    className="p-1 text-neutral-500 hover:text-indigo-400 transition-colors"
                  >
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Saved / Bookmarked Builds Queue */}
      <div className="pt-1.5 mt-1 border-t border-white/[0.06]">
        <button
          type="button"
          onClick={() => {
            if (onToggleSaved) {
              onToggleSaved(!showSavedOnly);
              onSelectTrack(null);
            }
          }}
          className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors cursor-pointer overflow-hidden ${
            showSavedOnly
              ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
              : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] text-indigo-400">
            <Bookmark className={`h-4 w-4 ${showSavedOnly ? "fill-indigo-400" : ""}`} />
          </div>
          <div
            className={`flex items-center justify-between flex-1 min-w-0 transition-opacity duration-200 ${
              isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <span className="font-mono text-xs truncate">Saved Queue</span>
            {savedProjects.length > 0 && (
              <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.2 font-mono text-[10px] text-indigo-300">
                {savedProjects.length}
              </span>
            )}
          </div>
        </button>
      </div>
    </aside>
  );
}
