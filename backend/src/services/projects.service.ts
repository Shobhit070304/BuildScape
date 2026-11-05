import mongoose, { Types } from "mongoose";
import { projectRepository } from "../repositories/projects.repository";
import { progressRepository } from "../repositories/progress.repository";
import { HttpError } from "./httpError";
import { validateProjectInput } from "./projectValidation";
import { feedbackRepository } from "../repositories/feedback.repository";
import { cacheAside, invalidateProjectCache, projectCacheKeys } from "./cache.service";

// Project browsing, enrollment, and progress use cases.
export const projectsService = {
  list: () => cacheAside(projectCacheKeys.list, async () =>
    (await projectRepository.list()).map((project) => project.toObject())
  ),

  async getBySlug(slug: string) {
    return cacheAside(projectCacheKeys.detail(slug), async () => {
      const project = await projectRepository.findBySlug(slug);
      if (!project) throw new HttpError(404, "Project not found");
      const learnerCount = await progressRepository.countEnrollments(project._id);
      return { ...project.toObject(), learnerCount };
    });
  },

  async enroll(userId: string, slug: string) {
    const project = await this.getBySlug(slug);
    const enrollment = await progressRepository.enroll(userId, project._id);
    await invalidateProjectCache(slug);
    return enrollment;
  },

  async completePhase(userId: string, slug: string, phaseId: string) {
    const project = await this.getBySlug(slug);
    const phaseIndex = project.phases.findIndex((item) => item.id === phaseId);
    if (phaseIndex === -1) throw new HttpError(404, "Phase not found");

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const enrollment = await progressRepository.findEnrollment(userId, project._id, session);
        if (!enrollment) throw new HttpError(403, "Enroll in this project before updating progress");

        await progressRepository.markPhaseComplete(userId, project._id, phaseId, session);
        const completedPhases = await progressRepository.listCompletedPhases(userId, project._id, session);

        // Keep the active phase aligned with the newly persisted completion.
        const currentIdx = enrollment.currentPhaseIndex ?? 0;
        const nextPhaseIndex = Math.min(
          Math.max(0, project.phases.length - 1),
          Math.max(currentIdx, phaseIndex + 1)
        );
        await progressRepository.setCurrentPhase(userId, project._id, nextPhaseIndex, session);

        if (completedPhases.length >= project.phases.length && project.phases.length > 0) {
          await progressRepository.setProjectCompletedIfMissing(userId, project._id, new Date(), session);
        }
      });
    } finally {
      await session.endSession();
    }
  },

  async uncompletePhase(userId: string, slug: string, phaseId: string) {
    const project = await this.getBySlug(slug);
    const phase = project.phases.find((item) => item.id === phaseId);
    if (!phase) throw new HttpError(404, "Phase not found");

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const enrollment = await progressRepository.findEnrollment(userId, project._id, session);
        if (!enrollment) throw new HttpError(403, "Enroll in this project before updating progress");

        await progressRepository.unmarkPhaseComplete(userId, project._id, phaseId, session);
        const remaining = await progressRepository.listCompletedPhases(userId, project._id, session);
        const firstIncompleteIndex = project.phases.findIndex(
          (item) => !remaining.some((completed) => completed.phaseId === item.id)
        );
        await progressRepository.setCurrentPhase(
          userId,
          project._id,
          Math.max(0, firstIncompleteIndex === -1 ? project.phases.length - 1 : firstIncompleteIndex),
          session
        );
        // Completion and repository-check achievements are retained when progress is edited.
      });
    } finally {
      await session.endSession();
    }
  },

  async clearProgress(userId: string, slug: string) {
    const project = await this.getBySlug(slug);
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const enrollment = await progressRepository.findEnrollment(userId, project._id, session);
        if (!enrollment) throw new HttpError(403, "Enroll in this project before clearing progress");
        await progressRepository.clearPhaseProgress(userId, project._id, session);
        await progressRepository.setCurrentPhase(userId, project._id, 0, session);
        // Deliberately retain completedAt and repository verification as earned achievements.
      });
    } finally {
      await session.endSession();
    }
  },

  async getProgress(userId: string, slug: string) {
    const project = await projectRepository.findPhasesBySlug(slug);
    if (!project) throw new HttpError(404, "Project not found");
    const [enrollment, completedPhases] = await Promise.all([
      progressRepository.findEnrollment(userId, project._id),
      progressRepository.listCompletedPhases(userId, project._id),
    ]);
    return {
      enrolled: Boolean(enrollment),
      currentPhaseIndex: enrollment?.currentPhaseIndex ?? 0,
      completedAt: enrollment?.completedAt,
      completedPhases: completedPhases.map(({ phaseId, completedAt }) => ({ phaseId, completedAt })),
      isVerified: Boolean(enrollment?.isVerified),
      githubRepoUrl: enrollment?.githubRepoUrl,
      liveDemoUrl: enrollment?.liveDemoUrl,
      verifiedAt: enrollment?.verifiedAt,
    };
  },

  async setCurrentPhase(userId: string, slug: string, phaseId: string) {
    const project = await this.getBySlug(slug);
    const phaseIndex = project.phases.findIndex((phase) => phase.id === phaseId);
    if (phaseIndex < 0) throw new HttpError(404, "Phase not found");
    const enrollment = await progressRepository.findEnrollment(userId, project._id);
    if (!enrollment) throw new HttpError(403, "Enroll in this project before updating your active phase");
    await progressRepository.setCurrentPhase(userId, project._id, phaseIndex);
    return phaseIndex;
  },

  async verifyProject(
    userId: string,
    slug: string,
    data: { githubRepoUrl: string; liveDemoUrl?: string }
  ) {
    if (!data || typeof data.githubRepoUrl !== "string" || !data.githubRepoUrl.trim()) {
      throw new HttpError(400, "GitHub repository URL is required");
    }

    const githubRegex = /^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?\/?$/i;
    const match = data.githubRepoUrl.trim().match(githubRegex);
    if (!match) {
      throw new HttpError(
        400,
        "Please provide a valid GitHub repository URL (e.g. https://github.com/username/project)"
      );
    }

    const owner = match[1];
    const repo = match[2];
    const project = await this.getBySlug(slug);
    const enrollment = await progressRepository.findEnrollment(userId, project._id);
    if (!enrollment) {
      throw new HttpError(400, "You must be enrolled in this project before linking a repository");
    }

    const completed = await progressRepository.listCompletedPhases(userId, project._id);
    const totalPhases = project.phases?.length ?? 0;
    const achievementAlreadyEarned = Boolean(enrollment.completedAt || enrollment.isVerified);
    if (!achievementAlreadyEarned && completed.length < totalPhases && totalPhases > 0) {
      throw new HttpError(
        400,
        `All phases must be completed before linking a repository (${completed.length}/${totalPhases} completed)`
      );
    }

    const liveDemoUrl = data.liveDemoUrl?.trim();
    if (liveDemoUrl) {
      try {
        const parsed = new URL(liveDemoUrl);
        if (!["http:", "https:"].includes(parsed.protocol) || liveDemoUrl.length > 2048) throw new Error();
      } catch {
        throw new HttpError(400, "Live demo URL must be a valid HTTP or HTTPS URL");
      }
    }

    // Confirm the submitted repository is public; this does not assess ownership or contents.
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        signal: AbortSignal.timeout(8000),
        headers: {
          "User-Agent": "BuildScape-Verifier",
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (response.status === 404) {
        throw new HttpError(
          400,
          "GitHub repository was not found or is private. Please ensure the repository is public."
        );
      }
      if (response.status !== 200) {
        throw new HttpError(503, "GitHub could not verify the repository right now. Please try again later.");
      }
    } catch (err: unknown) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(503, "GitHub verification is unavailable. Please try again later.");
    }

    const session = await mongoose.startSession();
    try {
      let updated: Awaited<ReturnType<typeof progressRepository.updateVerification>> = null;
      await session.withTransaction(async () => {
        const currentEnrollment = await progressRepository.findEnrollment(userId, project._id, session);
        if (!currentEnrollment) {
          throw new HttpError(400, "You must be enrolled in this project before linking a repository");
        }
        const currentCompletions = await progressRepository.listCompletedPhases(userId, project._id, session);
        const achievementAlreadyEarned = Boolean(currentEnrollment.completedAt || currentEnrollment.isVerified);
        if (!achievementAlreadyEarned && currentCompletions.length < totalPhases && totalPhases > 0) {
          throw new HttpError(400, "Complete all phases before linking a repository");
        }

        const now = new Date();
        await progressRepository.setProjectCompletedIfMissing(userId, project._id, now, session);
        updated = await progressRepository.updateVerification(userId, project._id, {
          githubRepoUrl: `https://github.com/${owner}/${repo}`,
          liveDemoUrl: liveDemoUrl || undefined,
          isVerified: true,
          verifiedAt: now,
        }, session);
      });
      return updated;
    } finally {
      await session.endSession();
    }
  },

  async getEnrolled(userId: string) {
    const enrollments = await progressRepository.listEnrollments(userId);
    return Promise.all(enrollments.map(async (enrollment) => {
      const project = enrollment.projectId as unknown as {
        _id: Types.ObjectId; slug: string; title: string; tagline: string; track: string;
        difficulty: string; estimatedHours: number; techStack: string[]; phases?: unknown[];
      } | null;
      if (!project) return null;
      const completed = await progressRepository.listCompletedPhases(userId, project._id);
      return {
        enrollmentId: enrollment._id,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        currentPhaseIndex: enrollment.currentPhaseIndex,
        completedCount: completed.length,
        totalPhases: project.phases?.length ?? 0,
        completedPhases: completed.map(({ phaseId }) => phaseId),
        isVerified: Boolean(enrollment.isVerified),
        githubRepoUrl: enrollment.githubRepoUrl,
        liveDemoUrl: enrollment.liveDemoUrl,
        verifiedAt: enrollment.verifiedAt,
        project: {
          _id: project._id, slug: project.slug, title: project.title, tagline: project.tagline,
          track: project.track, difficulty: project.difficulty,
          estimatedHours: project.estimatedHours, techStack: project.techStack,
        },
      };
    })).then((items) => items.filter((item) => item !== null));
  },

  create: async (values: unknown) => {
    validateProjectInput(values);
    try {
      const project = await projectRepository.create(values);
      await invalidateProjectCache(project.slug);
      return project;
    } catch (error) {
      if ((error as { code?: number }).code === 11000) throw new HttpError(409, "A project with that slug already exists");
      throw error;
    }
  },

  update: async (slug: string, values: unknown) => {
    validateProjectInput(values);
    try {
      const existing = await projectRepository.findBySlug(slug);
      if (!existing) throw new HttpError(404, "Project not found");
      const retainedPhaseIds = new Set(values.phases.map((phase) => phase.id));
      const removedPhaseIds = existing.phases
        .map((phase) => phase.id)
        .filter((phaseId) => !retainedPhaseIds.has(phaseId));
      if (removedPhaseIds.length > 0) {
        const [progressCount, noteCount] = await Promise.all([
          progressRepository.countByPhaseIds(existing._id, removedPhaseIds),
          feedbackRepository.countNotesByPhaseIds(existing._id, removedPhaseIds),
        ]);
        if (progressCount > 0 || noteCount > 0) {
          throw new HttpError(409, "A phase with learner progress or private notes cannot be removed. Keep its phase ID or create a new project.");
        }
      }
      const project = await projectRepository.updateBySlug(slug, values);
      await invalidateProjectCache(slug, project.slug);
      return project;
    } catch (error) {
      if ((error as { code?: number }).code === 11000) throw new HttpError(409, "A project with that slug already exists");
      throw error;
    }
  },

  delete: async (slug: string) => {
    const session = await mongoose.startSession();
    try {
      const deletedProject = await session.withTransaction(async () => {
        const project = await projectRepository.deleteBySlug(slug, session);
        if (!project) throw new HttpError(404, "Project not found");
        await progressRepository.deleteProjectData(project._id, session);
        await feedbackRepository.deleteProjectFeedback(project._id, session);
        return project;
      });
      if (!deletedProject) throw new HttpError(404, "Project not found");
      await invalidateProjectCache(slug);
      return deletedProject;
    } finally {
      await session.endSession();
    }
  },
};
