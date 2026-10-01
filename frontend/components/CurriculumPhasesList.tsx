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

  const onStepClick = (e: React.MouseEvent, phaseId: string, phaseIndex: number) => {
    if (!isEnrolled) {
      handlePhaseClick(e, phaseId, phaseIndex);
    } else {
      router.push(`/projects/${project.slug}/workspace?phase=${phaseId}`);
    }
  };

  return (
    <div className="w-full">
      {promptMessage && (
        <div className="mb-6 rounded-lg border border-amber-800/60 bg-amber-950/40 p-3 text-xs text-amber-200 flex items-center justify-between animate-fadeIn">
          <span>🔒 {promptMessage}</span>
          <button
            onClick={() => setPromptMessage(null)}
            className="text-amber-400 hover:text-amber-100 text-xs underline ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Image 2 ROADMAP Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-7">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold tracking-widest text-[#a855f7] uppercase">
            ROADMAP
          </span>
          <div className="h-px w-12 bg-zinc-800 hidden sm:block" />
        </div>
        <span className="font-mono text-xs text-zinc-500">
          {project.phases.length} steps
        </span>
      </div>

      {/* Image 2 Continuous Vertical Roadmap Timeline */}
      <div className="relative pl-6 sm:pl-7">
        {/* Continuous vertical line connecting all step nodes */}
        <div className="absolute left-1.75 top-2.5 bottom-6 w-px bg-zinc-800" />

        <div className="space-y-7">
          {project.phases.map((phase, idx) => {
            const stepNum = String(idx + 1).padStart(2, "0");
            const description = getPhaseDescription(phase);

            return (
              <div
                key={phase.id}
                onClick={(e) => onStepClick(e, phase.id, idx)}
                className="group relative cursor-pointer select-none"
              >
                {/* Circle Node ○ on the line */}
                <div className="absolute -left-6 sm:-left-6.75 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-zinc-600 bg-bg transition-all duration-200 group-hover:border-purple-400 group-hover:scale-110">
                  <div className="h-1 w-1 rounded-full bg-zinc-500 group-hover:bg-purple-400 transition-colors" />
                </div>

                {/* Step Title Row */}
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-2 sm:gap-2.5 min-w-0">
                    <span className="font-mono text-xs font-medium text-zinc-400 shrink-0">
                      {stepNum}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-100 transition-colors group-hover:text-purple-300 truncate">
                      {phase.title}
                    </h3>
                  </div>
                </div>

                {/* Step Description */}
                <p className="mt-1 pl-6 sm:pl-7 text-xs leading-relaxed text-zinc-400 transition-colors group-hover:text-zinc-300">
                  {description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
