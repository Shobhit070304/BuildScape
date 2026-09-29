"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, CheckCircle2, Play } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Project, Phase } from "@/lib/projects";
import { getPhaseDescription } from "@/lib/projects";

interface CurriculumPhasesListProps {
  project: Project;
}

export function CurriculumPhasesList({ project }: CurriculumPhasesListProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [promptMessage, setPromptMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsEnrolled(false);
      return;
    }

    api
      .getProgress(project.slug)
      .then((data) => setIsEnrolled(data.enrolled))
      .catch(() => {
        const local = localStorage.getItem(`enrolled_${project.slug}`);
        setIsEnrolled(local === "true");
      });
  }, [user, project.slug]);

  const handlePhaseClick = (e: React.MouseEvent, phaseId: string, phaseIndex: number) => {
    if (!isEnrolled) {
      e.preventDefault();
      setPromptMessage(`Enroll in "${project.title}" to unlock Phase ${phaseIndex + 1} workspace.`);

      // Smooth scroll to the enrollment box
      const box = document.getElementById("enrollment-box");
      if (box) {
        box.scrollIntoView({ behavior: "smooth", block: "center" });
        box.classList.add("ring-2", "ring-amber-500", "transition-all");
        setTimeout(() => {
          box.classList.remove("ring-2", "ring-amber-500");
        }, 2000);
      }
    }
  };

  return (
    <div className="space-y-3">
      {promptMessage && (
        <div className="rounded-lg border border-amber-800/60 bg-amber-950/40 p-3 text-xs text-amber-200 flex items-center justify-between animate-fadeIn">
          <span>🔒 {promptMessage}</span>
          <button
            onClick={() => setPromptMessage(null)}
            className="text-amber-400 hover:text-amber-100 text-xs underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {project.phases.map((phase, idx) => {
        const description = getPhaseDescription(phase);

        return (
          <div
            key={phase.id}
            onClick={(e) => handlePhaseClick(e, phase.id, idx)}
            className={`group relative block rounded-xl border p-4 transition-all duration-200 ${
              isEnrolled
                ? "cursor-pointer border-[#221f1a] bg-[#11100e] hover:-translate-y-0.5 hover:border-amber-700/50 hover:bg-[#151310] hover:shadow-lg"
                : "cursor-pointer border-[#1f1d19] bg-[#0d0c0a] opacity-80 hover:opacity-100 hover:border-amber-900/60"
            }`}
          >
            <div className="flex items-start gap-3.5">
              {/* Phase Number Badge */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold transition-colors ${
                  isEnrolled
                    ? "border-amber-800/40 bg-amber-950/30 text-[#c9a96e] group-hover:border-amber-600/60 group-hover:bg-amber-900/40 group-hover:text-amber-300"
                    : "border-stone-800 bg-stone-900 text-stone-500"
                }`}
              >
                {String(idx + 1).padStart(2, "0")}
              </div>

              {/* Phase Details */}
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-[#e4ddd3] transition-colors group-hover:text-[#d4b577]">
                    {phase.title}
                  </h3>
                  <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[#5c5449]">
                    Phase {idx + 1} of {project.phases.length}
                  </span>
                </div>

                {/* Phase Description */}
                <p className="text-[0.78rem] leading-relaxed text-[#8a8178] transition-colors group-hover:text-[#a89f91]">
                  {description}
                </p>
              </div>

              {/* Action indicator */}
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 group-hover:text-amber-400 transition-colors">
                {isEnrolled ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#2a241c] bg-[#1a1713] text-[#c9a96e]">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1 rounded bg-stone-900/90 border border-stone-800 px-2 py-0.5 text-[0.62rem] text-stone-400">
                    <Lock className="h-2.5 w-2.5 text-amber-500/80" />
                    <span>Locked</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
