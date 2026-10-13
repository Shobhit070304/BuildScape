import { Types } from "mongoose";
import type { IProject } from "../models/Project";
import { projectRepository } from "../repositories/projects.repository";
import { progressRepository } from "../repositories/progress.repository";
import { HttpError } from "./httpError";

// Project browsing, enrollment, and progress use cases.
export const projectsService = {
  list: () => projectRepository.list(),

  async getBySlug(slug: string) {
    const project = await projectRepository.findBySlug(slug);
    if (!project) throw new HttpError(404, "Project not found");
    return project;
  },

  async enroll(userId: string, slug: string) {
    const project = await this.getBySlug(slug);
    return progressRepository.enroll(userId, project._id);
  },

  async completePhase(userId: string, slug: string, phaseId: string) {
    const project = await this.getBySlug(slug);
    const phaseIndex = project.phases.findIndex((item) => item.id === phaseId);
    if (phaseIndex === -1) throw new HttpError(404, "Phase not found");

    await progressRepository.markPhaseComplete(userId, project._id, phaseId);

    // 0-based progression: advance to next phase index if user was on or behind this phase
    const enrollment = await progressRepository.findEnrollment(userId, project._id);
    const currentIdx = enrollment?.currentPhaseIndex ?? 0;
    const nextPhaseIndex = Math.min(
      Math.max(0, project.phases.length - 1),
      Math.max(currentIdx, phaseIndex + 1)
    );
    await progressRepository.setCurrentPhase(userId, project._id, nextPhaseIndex);

    // Check if all phases are completed
    const completedPhases = await progressRepository.listCompletedPhases(userId, project._id);
    if (completedPhases.length >= project.phases.length && project.phases.length > 0) {
      await progressRepository.setProjectCompleted(userId, project._id, new Date());
    }
  },

  async uncompletePhase(userId: string, slug: string, phaseId: string) {
    const project = await this.getBySlug(slug);
    const phase = project.phases.find((item) => item.id === phaseId);
    if (!phase) throw new HttpError(404, "Phase not found");

    await progressRepository.unmarkPhaseComplete(userId, project._id, phaseId);
    await progressRepository.setProjectCompleted(userId, project._id, null);
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
      completedPhases: completedPhases.map(({ phaseId, completedAt }) => ({ phaseId, completedAt })),
      isVerified: Boolean(enrollment?.isVerified),
      githubRepoUrl: enrollment?.githubRepoUrl,
      liveDemoUrl: enrollment?.liveDemoUrl,
      verifiedAt: enrollment?.verifiedAt,
    };
  },

  async verifyProject(
    userId: string,
    slug: string,
    data: { githubRepoUrl: string; liveDemoUrl?: string }
  ) {
    if (!data.githubRepoUrl) {
      throw new HttpError(400, "GitHub repository URL is required");
    }

    const githubRegex = /^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(\/|\.git)?$/;
    const match = data.githubRepoUrl.trim().match(githubRegex);
    if (!match) {
      throw new HttpError(
        400,
        "Please provide a valid GitHub repository URL (e.g. https://github.com/username/project)"
      );
    }

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, "");

    // Verify existence via GitHub API
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
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
    } catch (err: unknown) {
      if (err instanceof HttpError) throw err;
      console.warn("GitHub verification check skipped due to API/network response:", err);
    }

    const project = await this.getBySlug(slug);
    const enrollment = await progressRepository.findEnrollment(userId, project._id);
    if (!enrollment) {
      throw new HttpError(400, "You must be enrolled in this project to verify proof of work");
    }

    const completed = await progressRepository.listCompletedPhases(userId, project._id);
    const totalPhases = project.phases?.length ?? 0;
    if (completed.length < totalPhases && totalPhases > 0) {
      throw new HttpError(
        400,
        `All phases must be completed before claiming verification (${completed.length}/${totalPhases} completed)`
      );
    }

    const now = new Date();
    await progressRepository.setProjectCompleted(userId, project._id, now);
    const updated = await progressRepository.updateVerification(userId, project._id, {
      githubRepoUrl: `https://github.com/${owner}/${repo}`,
      liveDemoUrl: data.liveDemoUrl?.trim() || undefined,
      isVerified: true,
      verifiedAt: now,
    });

    return updated;
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

  create: (values: Partial<IProject>) => projectRepository.create(values),

  // updateBySlug now throws HttpError(404) internally if slug not found.
  update: (slug: string, values: Partial<IProject>) => projectRepository.updateBySlug(slug, values),

  delete: async (slug: string) => {
    const project = await projectRepository.deleteBySlug(slug);
    if (!project) throw new HttpError(404, "Project not found");
    return project;
  },
};
