import { Types } from "mongoose";
import { randomBytes } from "crypto";
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
    const enrollment = await progressRepository.findEnrollment(userId, project._id);
    if (!enrollment) throw new HttpError(403, "Enroll in this project before recording progress");
    const phaseIndex = project.phases.findIndex((item) => item.id === phaseId);
    if (phaseIndex === -1) throw new HttpError(404, "Phase not found");

    await progressRepository.markPhaseComplete(userId, project._id, phaseId);

    // 0-based progression: advance to next phase index if user was on or behind this phase
    const currentIdx = enrollment.currentPhaseIndex ?? 0;
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

    const enrollment = await progressRepository.findEnrollment(userId, project._id);
    if (!enrollment) throw new HttpError(403, "Enroll in this project before recording progress");

    await progressRepository.unmarkPhaseComplete(userId, project._id, phaseId);
    await progressRepository.clearVerification(userId, project._id);
    await progressRepository.setCurrentPhase(userId, project._id, Math.min(enrollment.currentPhaseIndex, project.phases.indexOf(phase)));
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
    if (!data.githubRepoUrl || typeof data.githubRepoUrl !== "string") {
      throw new HttpError(400, "GitHub repository URL is required");
    }

    let githubUrl: URL;
    try {
      githubUrl = new URL(data.githubRepoUrl.trim());
    } catch {
      throw new HttpError(400, "Please provide a valid GitHub repository URL");
    }
    const pathParts = githubUrl.pathname.split("/").filter(Boolean);
    if (githubUrl.protocol !== "https:" || githubUrl.hostname.toLowerCase() !== "github.com" || pathParts.length !== 2) {
      throw new HttpError(
        400,
        "Please provide a valid GitHub repository URL (e.g. https://github.com/username/project)"
      );
    }

    const owner = pathParts[0];
    const repo = pathParts[1].replace(/\.git$/i, "");
    if (!/^[a-zA-Z0-9_.-]+$/.test(owner) || !/^[a-zA-Z0-9_.-]+$/.test(repo)) {
      throw new HttpError(400, "Please provide a valid GitHub repository URL");
    }

    const project = await this.getBySlug(slug);
    const enrollment = await progressRepository.findEnrollmentWithChallenge(userId, project._id);
    if (!enrollment) {
      throw new HttpError(400, "You must be enrolled in this project to verify proof of work");
    }

    if (project.phases.length === 0) {
      throw new HttpError(400, "This project has no phases to complete and cannot be verified");
    }

    const completed = await progressRepository.listCompletedPhases(userId, project._id);
    const completedIds = new Set(completed.map(({ phaseId }) => phaseId));
    if (!project.phases.every((phase) => completedIds.has(phase.id))) {
      const validCompletedCount = project.phases.filter((phase) => completedIds.has(phase.id)).length;
      throw new HttpError(400, `All phases must be completed before claiming verification (${validCompletedCount}/${project.phases.length} completed)`);
    }

    let liveDemoUrl: string | undefined;
    if (data.liveDemoUrl !== undefined && data.liveDemoUrl !== "") {
      if (typeof data.liveDemoUrl !== "string") throw new HttpError(400, "Live demo URL must be a valid HTTPS URL");
      try {
        const parsedDemoUrl = new URL(data.liveDemoUrl.trim());
        if (parsedDemoUrl.protocol !== "https:" || parsedDemoUrl.username || parsedDemoUrl.password) {
          throw new Error("Invalid live demo URL");
        }
        liveDemoUrl = parsedDemoUrl.toString();
      } catch {
        throw new HttpError(400, "Live demo URL must be a valid HTTPS URL");
      }
    }
    if (!enrollment.verificationChallenge) {
      throw new HttpError(400, "Request a repository verification challenge before submitting proof");
    }

    // Fail closed: both the public repository and its challenge file must be accessible.
    try {
      const headers = {
        "User-Agent": "BuildScape-Verifier",
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      };
      const repoResponse = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
        headers,
        signal: AbortSignal.timeout(8000),
      });
      if (repoResponse.status === 404) throw new HttpError(400, "GitHub repository was not found or is private");
      if (!repoResponse.ok) throw new HttpError(503, "GitHub could not verify the repository right now. Please try again later.");
      const repoData = await repoResponse.json() as { private?: boolean; default_branch?: string };
      if (repoData.private || !repoData.default_branch) {
        throw new HttpError(400, "The GitHub repository must be public");
      }

      const challengeResponse = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(".buildscape-verification")}?ref=${encodeURIComponent(repoData.default_branch)}`,
        { headers, signal: AbortSignal.timeout(8000) }
      );
      if (challengeResponse.status === 404) {
        throw new HttpError(400, "Add the requested .buildscape-verification file to the repository root, then try again");
      }
      if (!challengeResponse.ok) {
        throw new HttpError(503, "GitHub could not verify the repository challenge right now. Please try again later.");
      }
      const challengeData = await challengeResponse.json() as { type?: string; encoding?: string; content?: string };
      const challengeContent = challengeData.encoding === "base64" && challengeData.content
        ? Buffer.from(challengeData.content, "base64").toString("utf8").trim()
        : "";
      if (challengeData.type !== "file" || challengeContent !== enrollment.verificationChallenge) {
        throw new HttpError(400, "The repository challenge file does not match. Copy the current challenge exactly and retry.");
      }
    } catch (err: unknown) {
      if (err instanceof HttpError) throw err;
      console.warn("GitHub verification request failed:", err);
      throw new HttpError(503, "GitHub could not be reached to verify the repository. Please try again later.");
    }

    const now = new Date();
    await progressRepository.setProjectCompleted(userId, project._id, now);
    const updated = await progressRepository.updateVerification(userId, project._id, {
      githubRepoUrl: `https://github.com/${owner}/${repo}`,
      liveDemoUrl,
      isVerified: true,
      verifiedAt: now,
    });

    return updated;
  },

  async getVerificationChallenge(userId: string, slug: string) {
    const project = await this.getBySlug(slug);
    const enrollment = await progressRepository.findEnrollmentWithChallenge(userId, project._id);
    if (!enrollment) throw new HttpError(403, "Enroll in this project before requesting a verification challenge");

    const challenge = enrollment.verificationChallenge ?? `buildscape:${project.slug}:${randomBytes(24).toString("hex")}`;
    if (!enrollment.verificationChallenge) {
      await progressRepository.setVerificationChallenge(userId, project._id, challenge);
    }
    return { challenge, fileName: ".buildscape-verification" };
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
