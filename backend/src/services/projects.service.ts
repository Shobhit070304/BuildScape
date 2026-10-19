import { Types } from "mongoose";
import { projectRepository } from "../repositories/projects.repository";
import { progressRepository } from "../repositories/progress.repository";
import { HttpError } from "./httpError";
import { loadProjectCatalog } from "./projectCatalog.service";

const canonicalSlugs = new Set(loadProjectCatalog().map(({ slug }) => slug));

export const projectsService = {
  async list() {
    return projectRepository.list();
  },

  countEnrolled(projectId: string) {
    return progressRepository.countEnrollments(projectId);
  },

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
    const phaseIndex = project.phases.findIndex((phase) => phase.id === phaseId);
    if (phaseIndex < 0) throw new HttpError(404, "Phase not found");

    await progressRepository.markPhaseComplete(userId, project._id, phaseId);
    const nextPhaseIndex = project.phases.length
      ? Math.min(project.phases.length - 1, Math.max(enrollment.currentPhaseIndex ?? 0, phaseIndex + 1))
      : 0;
    await progressRepository.setCurrentPhase(userId, project._id, nextPhaseIndex);
  },

  async uncompletePhase(userId: string, slug: string, phaseId: string) {
    const project = await this.getBySlug(slug);
    const phaseIndex = project.phases.findIndex((phase) => phase.id === phaseId);
    if (phaseIndex < 0) throw new HttpError(404, "Phase not found");
    const enrollment = await progressRepository.findEnrollment(userId, project._id);
    if (!enrollment) throw new HttpError(403, "Enroll in this project before recording progress");

    await progressRepository.unmarkPhaseComplete(userId, project._id, phaseId);
    await progressRepository.setCurrentPhase(userId, project._id, Math.min(enrollment.currentPhaseIndex, phaseIndex));
  },

  async getProgress(userId: string, slug: string) {
    const project = await projectRepository.findPhasesBySlug(slug);
    if (!project) throw new HttpError(404, "Project not found");
    const [enrollment, completedPhases] = await Promise.all([
      progressRepository.findEnrollment(userId, project._id),
      progressRepository.listCompletedPhases(userId, project._id),
    ]);
    const validPhaseIds = new Set(project.phases.map((phase) => phase.id));
    const currentPhaseIndex = project.phases.length > 0
      ? Math.min(project.phases.length - 1, Math.max(0, enrollment?.currentPhaseIndex ?? 0))
      : 0;
    return {
      enrolled: Boolean(enrollment),
      currentPhaseIndex,
      completedPhases: completedPhases
        .filter(({ phaseId }) => validPhaseIds.has(phaseId))
        .map(({ phaseId, completedAt }) => ({ phaseId, completedAt })),
    };
  },

  async getEnrolled(userId: string) {
    const enrollments = await progressRepository.listEnrollments(userId);
    return Promise.all(enrollments.map(async (enrollment) => {
      const project = enrollment.projectId as unknown as {
        _id: Types.ObjectId; slug: string; title: string; tagline: string; track: string;
        difficulty: "Beginner" | "Intermediate" | "Expert"; estimatedHours: number; techStack: string[]; phases?: { id: string }[];
      } | null;
      if (!project || !canonicalSlugs.has(project.slug)) return null;
      const validPhaseIds = new Set((project.phases ?? []).map((phase) => phase.id));
      const completed = (await progressRepository.listCompletedPhases(userId, project._id))
        .filter(({ phaseId }) => validPhaseIds.has(phaseId));
      return {
        enrollmentId: enrollment._id,
        enrolledAt: enrollment.enrolledAt,
        currentPhaseIndex: project.phases?.length
          ? Math.min(project.phases.length - 1, Math.max(0, enrollment.currentPhaseIndex ?? 0))
          : 0,
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
};
