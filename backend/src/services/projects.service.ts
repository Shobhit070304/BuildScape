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
    const phase = project.phases.find((item) => item.id === phaseId);
    if (!phase) throw new HttpError(404, "Phase not found");
    await progressRepository.markPhaseComplete(userId, project._id, phaseId);
    await progressRepository.setCurrentPhase(userId, project._id, phase.orderIndex);
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
    };
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
        project: {
          _id: project._id, slug: project.slug, title: project.title, tagline: project.tagline,
          track: project.track, difficulty: project.difficulty,
          estimatedHours: project.estimatedHours, techStack: project.techStack,
        },
      };
    })).then((items) => items.filter((item) => item !== null));
  },

  create: (values: Partial<IProject>) => projectRepository.create(values),
  update: (slug: string, values: Partial<IProject>) => projectRepository.updateBySlug(slug, values),
  delete: async (slug: string) => {
    const project = await projectRepository.deleteBySlug(slug);
    if (!project) throw new HttpError(404, "Project not found");
    return project;
  },
};
