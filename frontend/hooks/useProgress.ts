"use client";

import { useState, useEffect, useCallback } from "react";

interface ProgressState {
  completed: string[];
  hydrated: boolean;
}

export function useProgress(projectSlug: string) {
  const storageKey = `buildscape_progress_${projectSlug}`;
  const [state, setState] = useState<ProgressState>({
    completed: [],
    hydrated: false,
  });

  // Hydrate from localStorage on mount.
  // Reading localStorage must happen in an effect (not on the server).
  // We batch both updates into a single setState to avoid cascading renders.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  }, [storageKey]);

  const togglePhase = useCallback(
    (phaseId: string) => {
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
    },
    [storageKey]
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
