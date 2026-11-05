"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface ProgressState {
  ownerId: string | null;
  enrolled: boolean;
  currentPhaseIndex: number;
  completed: string[];
  hydrated: boolean;
  loadError: string | null;
  isVerified: boolean;
  githubRepoUrl?: string;
  liveDemoUrl?: string;
  verifiedAt?: string;
}

export function useProgress(projectSlug: string, enabled = true) {
  const { user, isLoading: authLoading } = useAuth();

  const [state, setState] = useState<ProgressState>({
    ownerId: null,
    enrolled: false,
    currentPhaseIndex: 0,
    completed: [],
    hydrated: false,
    loadError: null,
    isVerified: false,
  });
  const phaseSaveQueue = useRef<Promise<unknown>>(Promise.resolve());
  const requestVersion = useRef(0);
  const phaseToggleInFlight = useRef(false);

  const fetchDbProgress = useCallback(async () => {
    if (!user || !enabled) return;
    const ownerId = user.id || null;
    const requestId = ++requestVersion.current;

    try {
      const data = await api.getProgress(projectSlug);
      if (requestId !== requestVersion.current) return;
      setState({
        ownerId,
        enrolled: data.enrolled,
        currentPhaseIndex: data.currentPhaseIndex,
        completed: data.completedPhases.map((p) => p.phaseId),
        hydrated: true,
        loadError: null,
        isVerified: Boolean(data.isVerified),
        githubRepoUrl: data.githubRepoUrl,
        liveDemoUrl: data.liveDemoUrl,
        verifiedAt: data.verifiedAt,
      });
    } catch (error) {
      if (requestId !== requestVersion.current) return;
      setState({
        ownerId,
        enrolled: false,
        currentPhaseIndex: 0,
        completed: [],
        hydrated: true,
        loadError: error instanceof Error ? error.message : "Could not load enrollment status.",
        isVerified: false,
      });
    }
  }, [projectSlug, user, enabled]);

  useEffect(() => {
    // Refresh after authentication changes; state updates follow the network response.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!authLoading) void fetchDbProgress();
  }, [authLoading, fetchDbProgress]);

  const togglePhase = useCallback(
    async (phaseId: string) => {
      if (!user || phaseToggleInFlight.current) return false;
      phaseToggleInFlight.current = true;
      const requestId = ++requestVersion.current;

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
        // The write succeeded, so keep its optimistic state even if the follow-up
        // read briefly fails; a later refresh can reconcile the remaining fields.
        try {
          const fresh = await api.getProgress(projectSlug);
          if (requestId === requestVersion.current) {
            setState({
              ownerId: user.id || null,
              enrolled: fresh.enrolled,
              currentPhaseIndex: fresh.currentPhaseIndex,
              completed: fresh.completedPhases.map((p) => p.phaseId),
              hydrated: true,
              loadError: null,
              isVerified: Boolean(fresh.isVerified),
              githubRepoUrl: fresh.githubRepoUrl,
              liveDemoUrl: fresh.liveDemoUrl,
              verifiedAt: fresh.verifiedAt,
            });
          }
        } catch (refreshError) {
          console.error("Phase progress was saved, but the follow-up refresh failed:", refreshError);
        }
        return true;
      } catch (err) {
        console.error("Failed to update phase progress in DB:", err);
        // Rollback on failure
        if (requestId === requestVersion.current) {
          setState((prev) => ({ ...prev, completed: previousCompleted }));
        }
        return false;
      } finally {
        phaseToggleInFlight.current = false;
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

  const belongsToCurrentUser = state.ownerId === (user?.id ?? null);
  return {
    enrolled: belongsToCurrentUser && state.enrolled,
    currentPhaseIndex: belongsToCurrentUser ? state.currentPhaseIndex : 0,
    completed: belongsToCurrentUser ? state.completed : [],
    hydrated: enabled && ((!authLoading && !user) || (belongsToCurrentUser && state.hydrated)),
    loadError: belongsToCurrentUser ? state.loadError : null,
    isVerified: belongsToCurrentUser && state.isVerified,
    githubRepoUrl: belongsToCurrentUser ? state.githubRepoUrl : undefined,
    liveDemoUrl: belongsToCurrentUser ? state.liveDemoUrl : undefined,
    verifiedAt: belongsToCurrentUser ? state.verifiedAt : undefined,
    togglePhase,
    setActivePhase,
    isCompleted,
    clearProgress,
    refreshProgress: fetchDbProgress,
  };
}

export type ProgressController = ReturnType<typeof useProgress>;
