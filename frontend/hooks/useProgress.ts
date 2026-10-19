"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface ProgressState {
  enrolled: boolean;
  currentPhaseIndex: number;
  completed: string[];
  hydrated: boolean;
}

export function useProgress(projectSlug: string) {
  const { user } = useAuth();

  const [state, setState] = useState<ProgressState>({
    enrolled: false,
    currentPhaseIndex: 0,
    completed: [],
    hydrated: false,
  });

  const fetchDbProgress = useCallback(async () => {
    if (!user) {
      setState({
        enrolled: false,
        currentPhaseIndex: 0,
        completed: [],
        hydrated: true,
      });
      return;
    }

    try {
      const data = await api.getProgress(projectSlug);
      setState({
        enrolled: data.enrolled,
        currentPhaseIndex: data.currentPhaseIndex,
        completed: data.completedPhases.map((p) => p.phaseId),
        hydrated: true,
      });
    } catch {
      setState({
        enrolled: false,
        currentPhaseIndex: 0,
        completed: [],
        hydrated: true,
      });
    }
  }, [projectSlug, user]);

  useEffect(() => {
    fetchDbProgress();
  }, [fetchDbProgress]);

  const togglePhase = useCallback(
    async (phaseId: string) => {
      if (!user) return;

      const isNowCompleting = !state.completed.includes(phaseId);

      // Optimistic update
      const previousCompleted = state.completed;
      const updated = isNowCompleting
        ? [...previousCompleted, phaseId]
        : previousCompleted.filter((id) => id !== phaseId);

      setState((prev) => ({ ...prev, completed: updated }));

      try {
        if (isNowCompleting) {
          await api.completePhase(projectSlug, phaseId);
        } else {
          await api.uncompletePhase(projectSlug, phaseId);
        }
        // Refresh accurate DB progress state (including currentPhaseIndex)
        const fresh = await api.getProgress(projectSlug);
        setState({
          enrolled: fresh.enrolled,
          currentPhaseIndex: fresh.currentPhaseIndex,
          completed: fresh.completedPhases.map((p) => p.phaseId),
          hydrated: true,
        });
      } catch (err) {
        console.error("Failed to update phase progress in DB:", err);
        // Rollback on failure
        setState((prev) => ({ ...prev, completed: previousCompleted }));
      }
    },
    [state.completed, user, projectSlug]
  );

  const isCompleted = useCallback(
    (phaseId: string) => state.completed.includes(phaseId),
    [state.completed]
  );

  const clearProgress = useCallback(async () => {
    if (!user || state.completed.length === 0) return;
    try {
      await Promise.all(state.completed.map((phaseId) => api.uncompletePhase(projectSlug, phaseId)));
      await fetchDbProgress();
    } catch (err) {
      console.error("Failed to reset progress in DB:", err);
    }
  }, [user, state.completed, projectSlug, fetchDbProgress]);

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
