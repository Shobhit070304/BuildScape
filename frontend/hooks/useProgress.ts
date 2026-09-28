"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface ProgressState {
  completed: string[];
  hydrated: boolean;
}

export function useProgress(projectSlug: string) {
  const storageKey = `buildscape_progress_${projectSlug}`;
  const { user } = useAuth();

  const [state, setState] = useState<ProgressState>({
    completed: [],
    hydrated: false,
  });

  // Hydrate: backend when logged in, localStorage when not
  useEffect(() => {
    if (user) {
      api
        .getProgress(projectSlug)
        .then((data) => {
          const ids = data.completedPhases.map((p) => p.phaseId);
          setState({ completed: ids, hydrated: true });
        })
        .catch(() => setState({ completed: [], hydrated: true }));
    } else {
      setState(() => {
        try {
          const stored = localStorage.getItem(storageKey);
          return {
            completed: stored ? (JSON.parse(stored) as string[]) : [],
            hydrated: true,
          };
        } catch {
          return { completed: [], hydrated: true };
        }
      });
    }
  }, [projectSlug, storageKey, user]);

  const togglePhase = useCallback(
    (phaseId: string) => {
      const isNowCompleting = !state.completed.includes(phaseId);

      setState((prev) => {
        const updated = prev.completed.includes(phaseId)
          ? prev.completed.filter((id) => id !== phaseId)
          : [...prev.completed, phaseId];

        // Persist locally always (fallback / offline)
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {
          /* ignore */
        }

        return { ...prev, completed: updated };
      });

      // Sync to backend if logged in and marking complete (no un-complete API for now)
      if (user && isNowCompleting) {
        api.completePhase(projectSlug, phaseId).catch(() => {
          /* fail silently — localStorage already saved */
        });
      }
    },
    [state.completed, storageKey, user, projectSlug]
  );

  const isCompleted = useCallback(
    (phaseId: string) => state.completed.includes(phaseId),
    [state.completed]
  );

  const clearProgress = useCallback(() => {
    setState((prev) => ({ ...prev, completed: [] }));
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  return {
    completed: state.completed,
    hydrated: state.hydrated,
    togglePhase,
    isCompleted,
    clearProgress,
  };
}

