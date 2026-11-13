import mongoose, { Types } from "mongoose";
import { projectRepository } from "../repositories/projects.repository";
import { progressRepository } from "../repositories/progress.repository";
import { userRepository } from "../repositories/users.repository";
import { verificationService } from "./verification.service";
import { HttpError } from "./httpError";
import { validateProjectInput } from "./projectValidation";
import { feedbackRepository } from "../repositories/feedback.repository";
import { cacheAside, invalidateProjectCache, projectCacheKeys } from "./cache.service";

// Project browsing, enrollment, and progress use cases.
export const projectsService = {
  list: () => cacheAside(projectCacheKeys.list, async () => {
    const [projects, countsMap] = await Promise.all([
      projectRepository.list(),
      progressRepository.getEnrollmentCountsByProject(),
    ]);
    return projects.map((project) => ({
      ...project.toObject(),
      learnerCount: countsMap.get(project._id.toString()) || 0,
    }));
  }),

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
    const targetPhase = project.phases[phaseIndex];

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const enrollment = await progressRepository.findEnrollment(userId, project._id, session);
        if (!enrollment) throw new HttpError(403, "Enroll in this project before updating progress");

        await progressRepository.markPhaseComplete(userId, project._id, phaseId, session);

        // When a phase is completed, also mark all tasks of this phase as completed
        if (targetPhase?.tasks && targetPhase.tasks.length > 0) {
          const taskIds = targetPhase.tasks.map((item) => item.id);
          await progressRepository.markAllPhaseTasksComplete(userId, project._id, phaseId, taskIds, session);
        }

        const completedPhases = await progressRepository.listCompletedPhases(userId, project._id, session);

        // Do not auto-switch phase on completion: keep user on current phase
        await progressRepository.setCurrentPhase(userId, project._id, phaseIndex, session);

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
    const phaseIndex = project.phases.findIndex((item) => item.id === phaseId);
    if (phaseIndex === -1) throw new HttpError(404, "Phase not found");

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const enrollment = await progressRepository.findEnrollment(userId, project._id, session);
        if (!enrollment) throw new HttpError(403, "Enroll in this project before updating progress");

        await progressRepository.unmarkPhaseComplete(userId, project._id, phaseId, session);
        // Do not auto-switch phase: keep user on current phase
        await progressRepository.setCurrentPhase(userId, project._id, phaseIndex, session);
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

  async toggleTaskProgress(userId: string, slug: string, phaseId: string, taskId: string, completed?: boolean) {
    const project = await this.getBySlug(slug);
    const phase = project.phases.find((item) => item.id === phaseId);
    if (!phase) throw new HttpError(404, "Phase not found");

    const enrollment = await progressRepository.findEnrollment(userId, project._id);
    if (!enrollment) throw new HttpError(403, "Enroll in this project before tracking task progress");

    const completedTasksMap = await progressRepository.listCompletedTasks(userId, project._id);
    const currentCompleted = completedTasksMap[phaseId] ?? [];
    const isNowCompleted = completed !== undefined ? completed : !currentCompleted.includes(taskId);

    await progressRepository.toggleMilestoneTask(userId, project._id, phaseId, taskId, isNowCompleted);

    const updatedTasksMap = await progressRepository.listCompletedTasks(userId, project._id);
    const completedTasksForPhase = updatedTasksMap[phaseId] ?? [];
    const phaseTasks = phase.tasks ?? [];
    let phaseAutoCompleted = false;

    // If all tasks of the phase are marked done, automatically mark the phase completed
    if (
      isNowCompleted &&
      phaseTasks.length > 0 &&
      phaseTasks.every((task) => completedTasksForPhase.includes(task.id))
    ) {
      const completedPhases = await progressRepository.listCompletedPhases(userId, project._id);
      const alreadyCompleted = completedPhases.some((item) => item.phaseId === phaseId);
      if (!alreadyCompleted) {
        await this.completePhase(userId, slug, phaseId);
        phaseAutoCompleted = true;
      }
    }

    return {
      taskId,
      phaseId,
      completed: isNowCompleted,
      completedTasks: completedTasksForPhase,
      phaseCompleted: phaseAutoCompleted,
    };
  },

  async verifyProjectSubmission(userId: string, slug: string, data: { githubRepoUrl: string; liveDemoUrl?: string }) {
    const project = await this.getBySlug(slug);
    const enrollment = await progressRepository.findEnrollment(userId, project._id);
    if (!enrollment) throw new HttpError(403, "Enroll in this project before requesting verification");

    const user = await userRepository.findById(userId);

    const verificationResult = await verificationService.verifyProjectSubmission(
      slug,
      data.githubRepoUrl,
      data.liveDemoUrl,
      user ? { name: user.name, username: user.username, email: user.email } : undefined
    );

    const updatedEnrollment = await progressRepository.setVerification(userId, project._id, {
      githubRepoUrl: verificationResult.githubRepoUrl,
      liveDemoUrl: verificationResult.liveDemoUrl,
      certificateId: verificationResult.certificateId,
      verificationDetails: verificationResult.verificationDetails,
    });

    await invalidateProjectCache(slug);

    return {
      isVerified: true,
      verifiedAt: updatedEnrollment?.verifiedAt || verificationResult.verifiedAt,
      certificateId: verificationResult.certificateId,
      githubRepoUrl: verificationResult.githubRepoUrl,
      liveDemoUrl: verificationResult.liveDemoUrl,
      verificationDetails: verificationResult.verificationDetails,
    };
  },

  async getCertificate(certificateId: string) {
    const enrollment = await progressRepository.findEnrollmentByCertificateId(certificateId);
    if (!enrollment) throw new HttpError(404, "Certificate not found or unverified");

    const user = enrollment.userId as unknown as { name: string; username?: string; avatar?: string } | null;
    const project = enrollment.projectId as unknown as {
      _id: Types.ObjectId;
      slug: string;
      title: string;
      tagline: string;
      track: string;
      difficulty: string;
      estimatedHours: number;
      techStack: string[];
      deliverable?: string;
      phases?: { id: string; title: string }[];
    } | null;

    if (!user || !project) throw new HttpError(404, "Certificate data could not be resolved");

    return {
      certificateId: enrollment.certificateId,
      verifiedAt: enrollment.verifiedAt || enrollment.completedAt || enrollment.enrolledAt,
      githubRepoUrl: enrollment.githubRepoUrl,
      liveDemoUrl: enrollment.liveDemoUrl,
      verificationDetails: enrollment.verificationDetails,
      recipient: {
        name: user.name,
        username: user.username,
        avatar: user.avatar,
      },
      project: {
        slug: project.slug,
        title: project.title,
        tagline: project.tagline,
        track: project.track,
        difficulty: project.difficulty,
        estimatedHours: project.estimatedHours,
        techStack: project.techStack,
        deliverable: project.deliverable,
        phaseCount: project.phases?.length ?? 0,
      },
    };
  },

  async getProgress(userId: string, slug: string) {
    const project = await projectRepository.findPhasesBySlug(slug);
    if (!project) throw new HttpError(404, "Project not found");
    const [enrollment, completedPhases, completedTasks] = await Promise.all([
      progressRepository.findEnrollment(userId, project._id),
      progressRepository.listCompletedPhases(userId, project._id),
      progressRepository.listCompletedTasks(userId, project._id),
    ]);
    return {
      enrolled: Boolean(enrollment),
      currentPhaseIndex: enrollment?.currentPhaseIndex ?? 0,
      completedAt: enrollment?.completedAt,
      isVerified: Boolean(enrollment?.isVerified),
      verifiedAt: enrollment?.verifiedAt,
      certificateId: enrollment?.certificateId,
      githubRepoUrl: enrollment?.githubRepoUrl,
      liveDemoUrl: enrollment?.liveDemoUrl,
      completedPhases: completedPhases.map(({ phaseId, completedAt }) => ({ phaseId, completedAt })),
      completedTasks,
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
        isVerified: Boolean(enrollment.isVerified),
        verifiedAt: enrollment.verifiedAt,
        certificateId: enrollment.certificateId,
        githubRepoUrl: enrollment.githubRepoUrl,
        liveDemoUrl: enrollment.liveDemoUrl,
        currentPhaseIndex: enrollment.currentPhaseIndex,
        completedCount: completed.length,
        totalPhases: project.phases?.length ?? 0,
        completedPhases: completed.map(({ phaseId }) => phaseId),
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
