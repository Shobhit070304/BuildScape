"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface ProgressState {
  enrolled: boolean;
  currentPhaseIndex: number;
  completed: string[];
  hydrated: boolean;
  isVerified: boolean;
  githubRepoUrl?: string;
  liveDemoUrl?: string;
  verifiedAt?: string;
}

export function useProgress(projectSlug: string) {
  const { user } = useAuth();

  const [state, setState] = useState<ProgressState>({
    enrolled: false,
    currentPhaseIndex: 0,
    completed: [],
    hydrated: false,
    isVerified: false,
  });
  const phaseSaveQueue = useRef<Promise<unknown>>(Promise.resolve());

  const fetchDbProgress = useCallback(async () => {
    if (!user) {
      setState({
        enrolled: false,
        currentPhaseIndex: 0,
        completed: [],
        hydrated: true,
        isVerified: false,
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
        isVerified: Boolean(data.isVerified),
        githubRepoUrl: data.githubRepoUrl,
        liveDemoUrl: data.liveDemoUrl,
        verifiedAt: data.verifiedAt,
      });
    } catch {
      setState({
        enrolled: false,
        currentPhaseIndex: 0,
        completed: [],
        hydrated: true,
        isVerified: false,
      });
    }
  }, [projectSlug, user]);

  useEffect(() => {
    fetchDbProgress();
  }, [fetchDbProgress]);

  const togglePhase = useCallback(
    async (phaseId: string) => {
      if (!user) return false;

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
          isVerified: Boolean(fresh.isVerified),
          githubRepoUrl: fresh.githubRepoUrl,
          liveDemoUrl: fresh.liveDemoUrl,
          verifiedAt: fresh.verifiedAt,
        });
        return true;
      } catch (err) {
        console.error("Failed to update phase progress in DB:", err);
        // Rollback on failure
        setState((prev) => ({ ...prev, completed: previousCompleted }));
        return false;
      }
    },
    [state.completed, user, projectSlug]
  );

  const isCompleted = useCallback(
    (phaseId: string) => state.completed.includes(phaseId),
    [state.completed]
  );

  const setActivePhase = useCallback((phaseId: string, index: number) => {
    if (!user) return;
    setState((prev) => ({ ...prev, currentPhaseIndex: index }));
    // Serialize writes so a slower earlier click cannot overwrite the latest selection.
    phaseSaveQueue.current = phaseSaveQueue.current
      .catch(() => undefined)
      .then(() => api.setActivePhase(projectSlug, phaseId))
      .catch((err) => {
        console.error("Failed to save active phase:", err);
        void fetchDbProgress();
      });
  }, [user, projectSlug, fetchDbProgress]);

  const clearProgress = useCallback(async () => {
    if (!user || state.completed.length === 0) return false;
    try {
      await api.clearProgress(projectSlug);
      await fetchDbProgress();
      return true;
    } catch (err) {
      console.error("Failed to reset progress in DB:", err);
      return false;
    }
  }, [user, state.completed, projectSlug, fetchDbProgress]);

  return {
    enrolled: state.enrolled,
    currentPhaseIndex: state.currentPhaseIndex,
    completed: state.completed,
    hydrated: state.hydrated,
    isVerified: state.isVerified,
    githubRepoUrl: state.githubRepoUrl,
    liveDemoUrl: state.liveDemoUrl,
    verifiedAt: state.verifiedAt,
    togglePhase,
    setActivePhase,
    isCompleted,
    clearProgress,
    refreshProgress: fetchDbProgress,
  };
}
