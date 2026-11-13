"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface ProgressState {
  ownerId: string | null;
  enrolled: boolean;
  currentPhaseIndex: number;
  completed: string[];
  completedTasks: Record<string, string[]>;
  isVerified: boolean;
  verifiedAt: string | null;
  certificateId: string | null;
  githubRepoUrl: string | null;
  liveDemoUrl: string | null;
  hydrated: boolean;
  loadError: string | null;
}

export function useProgress(projectSlug: string, enabled = true) {
  const { user, isLoading: authLoading } = useAuth();

  const [state, setState] = useState<ProgressState>({
    ownerId: null,
    enrolled: false,
    currentPhaseIndex: 0,
    completed: [],
    completedTasks: {},
    isVerified: false,
    verifiedAt: null,
    certificateId: null,
    githubRepoUrl: null,
    liveDemoUrl: null,
    hydrated: false,
    loadError: null,
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
        completedTasks: data.completedTasks || {},
        isVerified: Boolean(data.isVerified),
        verifiedAt: data.verifiedAt || null,
        certificateId: data.certificateId || null,
        githubRepoUrl: data.githubRepoUrl || null,
        liveDemoUrl: data.liveDemoUrl || null,
        hydrated: true,
        loadError: null,
      });
    } catch (error) {
      if (requestId !== requestVersion.current) return;
      setState({
        ownerId,
        enrolled: false,
        currentPhaseIndex: 0,
        completed: [],
        completedTasks: {},
        isVerified: false,
        verifiedAt: null,
        certificateId: null,
        githubRepoUrl: null,
        liveDemoUrl: null,
        hydrated: true,
        loadError: error instanceof Error ? error.message : "Could not load enrollment status.",
      });
    }
  }, [projectSlug, user, enabled]);

  useEffect(() => {
    // Refresh after authentication changes; state updates follow the network response.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!authLoading) void fetchDbProgress();
  }, [authLoading, fetchDbProgress]);

  const togglePhase = useCallback(
    async (phaseId: string, phaseTaskIds?: string[]) => {
      if (!user || phaseToggleInFlight.current) return false;
      phaseToggleInFlight.current = true;
      const requestId = ++requestVersion.current;

      const isNowCompleting = !state.completed.includes(phaseId);

      // Optimistic update
      const previousCompleted = state.completed;
      const previousTasks = state.completedTasks[phaseId] || [];
      const updated = isNowCompleting
        ? [...previousCompleted, phaseId]
        : previousCompleted.filter((id) => id !== phaseId);

      setState((prev) => ({
        ...prev,
        completed: updated,
        completedTasks: isNowCompleting && phaseTaskIds && phaseTaskIds.length > 0
          ? {
              ...prev.completedTasks,
              [phaseId]: Array.from(new Set([...(prev.completedTasks[phaseId] || []), ...phaseTaskIds])),
            }
          : prev.completedTasks,
      }));

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
              completedTasks: fresh.completedTasks || {},
              isVerified: Boolean(fresh.isVerified),
              verifiedAt: fresh.verifiedAt || null,
              certificateId: fresh.certificateId || null,
              githubRepoUrl: fresh.githubRepoUrl || null,
              liveDemoUrl: fresh.liveDemoUrl || null,
              hydrated: true,
              loadError: null,
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
          setState((prev) => ({
            ...prev,
            completed: previousCompleted,
            completedTasks: {
              ...prev.completedTasks,
              [phaseId]: previousTasks,
            },
          }));
        }
        return false;
      } finally {
        phaseToggleInFlight.current = false;
      }
    },
    [state.completed, state.completedTasks, user, projectSlug]
  );

  const isCompleted = useCallback(
    (phaseId: string) => state.completed.includes(phaseId),
    [state.completed]
  );

  const isTaskCompleted = useCallback(
    (phaseId: string, taskId: string) => {
      const tasks = state.completedTasks[phaseId];
      return Array.isArray(tasks) && tasks.includes(taskId);
    },
    [state.completedTasks]
  );

  const toggleTask = useCallback(
    async (phaseId: string, taskId: string, allPhaseTaskIds?: string[]) => {
      if (!user) return false;
      const currentTasks = state.completedTasks[phaseId] || [];
      const isNowCompleting = !currentTasks.includes(taskId);

      // Optimistic update
      const updatedTasks = isNowCompleting
        ? [...currentTasks, taskId]
        : currentTasks.filter((id) => id !== taskId);

      const allTasksNowCompleted =
        isNowCompleting &&
        allPhaseTaskIds &&
        allPhaseTaskIds.length > 0 &&
        allPhaseTaskIds.every((id) => updatedTasks.includes(id));

      const shouldAutoMarkPhase = allTasksNowCompleted && !state.completed.includes(phaseId);
      const previousCompleted = state.completed;

      setState((prev) => ({
        ...prev,
        completed: shouldAutoMarkPhase ? [...prev.completed, phaseId] : prev.completed,
        completedTasks: {
          ...prev.completedTasks,
          [phaseId]: updatedTasks,
        },
      }));

      try {
        const res = await api.toggleTaskProgress(projectSlug, phaseId, taskId, isNowCompleting);
        setState((prev) => ({
          ...prev,
          completed:
            res.phaseCompleted && !prev.completed.includes(phaseId)
              ? [...prev.completed, phaseId]
              : prev.completed,
          completedTasks: {
            ...prev.completedTasks,
            [phaseId]: res.completedTasks,
          },
        }));
        return true;
      } catch (err) {
        console.error("Failed to toggle task progress:", err);
        // Rollback
        setState((prev) => ({
          ...prev,
          completed: previousCompleted,
          completedTasks: {
            ...prev.completedTasks,
            [phaseId]: currentTasks,
          },
        }));
        return false;
      }
    },
    [state.completed, state.completedTasks, user, projectSlug]
  );

  const setVerificationSuccess = useCallback(
    (data: { isVerified: boolean; certificateId: string; verifiedAt: string; githubRepoUrl: string; liveDemoUrl?: string }) => {
      setState((prev) => ({
        ...prev,
        isVerified: data.isVerified,
        certificateId: data.certificateId,
        verifiedAt: data.verifiedAt,
        githubRepoUrl: data.githubRepoUrl,
        liveDemoUrl: data.liveDemoUrl || null,
      }));
    },
    []
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
    completedTasks: belongsToCurrentUser ? state.completedTasks : {},
    isVerified: belongsToCurrentUser && state.isVerified,
    verifiedAt: belongsToCurrentUser ? state.verifiedAt : null,
    certificateId: belongsToCurrentUser ? state.certificateId : null,
    githubRepoUrl: belongsToCurrentUser ? state.githubRepoUrl : null,
    liveDemoUrl: belongsToCurrentUser ? state.liveDemoUrl : null,
    hydrated: enabled && ((!authLoading && !user) || (belongsToCurrentUser && state.hydrated)),
    loadError: belongsToCurrentUser ? state.loadError : null,
    togglePhase,
    toggleTask,
    isTaskCompleted,
    setVerificationSuccess,
    setActivePhase,
    isCompleted,
    clearProgress,
    refreshProgress: fetchDbProgress,
  };
}

export type ProgressController = ReturnType<typeof useProgress>;
