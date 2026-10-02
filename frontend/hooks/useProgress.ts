"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface ProgressState {
  enrolled: boolean;
  currentPhaseIndex: number;
  completed: string[];
  hydrated: boolean;
}

export function useProgress(projectSlug: string) {
  const storageKey = useMemo(
    () => `buildscape_progress_${projectSlug}`,
    [projectSlug]
  );
  const { user } = useAuth();

  const [state, setState] = useState<ProgressState>({
    enrolled: false,
    currentPhaseIndex: 0,
    completed: [],
    hydrated: false,
  });

  // Hydrate: backend when logged in, localStorage when not.
  useEffect(() => {
    if (user) {
      api
        .getProgress(projectSlug)
        .then((data) => {
          setState({
            enrolled: data.enrolled,
            currentPhaseIndex: data.currentPhaseIndex,
            completed: data.completedPhases.map((p) => p.phaseId),
            hydrated: true,
          });
        })
        .catch(() =>
          setState({ enrolled: false, currentPhaseIndex: 0, completed: [], hydrated: true })
        );
    } else {
      setState(() => {
        try {
          const stored = localStorage.getItem(storageKey);
          return {
            enrolled: false,
            currentPhaseIndex: 0,
            completed: stored ? (JSON.parse(stored) as string[]) : [],
            hydrated: true,
          };
        } catch {
          return { enrolled: false, currentPhaseIndex: 0, completed: [], hydrated: true };
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

        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {
          /* ignore */
        }

        return { ...prev, completed: updated };
      });

      // Sync to backend if logged in and marking complete (no un-complete API).
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
    enrolled: state.enrolled,
    currentPhaseIndex: state.currentPhaseIndex,
    completed: state.completed,
    hydrated: state.hydrated,
    togglePhase,
    isCompleted,
    clearProgress,
  };
}
