import { createHash } from "node:crypto";
import { Types } from "mongoose";
import { projectRepository } from "../repositories/projects.repository";
import { progressRepository } from "../repositories/progress.repository";
import { userRepository } from "../repositories/users.repository";
import { HttpError } from "./httpError";
import { loadProjectCatalog } from "./projectCatalog.service";
import { getOrLoadCached } from "./cache.service";

const canonicalProjects = loadProjectCatalog();
const canonicalProjectsBySlug = new Map(canonicalProjects.map((project) => [project.slug, project]));
const cacheNamespace = createHash("sha256").update(JSON.stringify(canonicalProjects)).digest("hex").slice(0, 12);
const projectCachePrefix = `buildscape:projects:v1:${cacheNamespace}`;
const PROJECT_CACHE_TTL_SECONDS = 300;

export const projectsService = {
  async list() {
    return getOrLoadCached(`${projectCachePrefix}:list`, PROJECT_CACHE_TTL_SECONDS, async () => {
      const projects = await projectRepository.list();
      return projects.map((project) => project.toObject());
    });
  },

  async getPublicBySlug(slug: string) {
    return getOrLoadCached(`${projectCachePrefix}:detail:${slug}`, PROJECT_CACHE_TTL_SECONDS, async () => {
      const project = await projectRepository.findBySlug(slug);
      if (!project) throw new HttpError(404, "Project not found");
      return project.toObject();
    });
  },

  countEnrolled(projectId: string | Types.ObjectId) {
    return progressRepository.countEnrollments(
      typeof projectId === "string" ? new Types.ObjectId(projectId) : projectId
    );
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

  async getBookmarked(userId: string) {
    const slugs = await userRepository.getBookmarkedProjectSlugs(userId);
    if (!slugs.length) return [];
    const projects = await projectRepository.findBySlugs(slugs);
    const bySlug = new Map(projects.map((project) => [project.slug, project]));
    return slugs.map((slug) => bySlug.get(slug)).filter((project) => project !== undefined);
  },

  async addBookmark(userId: string, slug: string) {
    await this.getBySlug(slug);
    const user = await userRepository.addBookmarkedProject(userId, slug);
    if (!user) throw new HttpError(404, "User not found");
  },

  async removeBookmark(userId: string, slug: string) {
    await this.getBySlug(slug);
    const user = await userRepository.removeBookmarkedProject(userId, slug);
    if (!user) throw new HttpError(404, "User not found");
  },

  async getProjectNotes(userId: string, slug: string) {
    const project = await this.getBySlug(slug);
    const enrollment = await progressRepository.getProjectNotes(userId, project._id);
    if (!enrollment) throw new HttpError(403, "Enroll in this project to use private project notes");
    return enrollment.notes ?? "";
  },

  async saveProjectNotes(userId: string, slug: string, notes: string) {
    const project = await this.getBySlug(slug);
    const enrollment = await progressRepository.setProjectNotes(userId, project._id, notes);
    if (!enrollment) throw new HttpError(403, "Enroll in this project to use private project notes");
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

  async resetProgress(userId: string, slug: string) {
    const project = await this.getBySlug(slug);
    const enrollment = await progressRepository.findEnrollment(userId, project._id);
    if (!enrollment) throw new HttpError(403, "Enroll in this project before resetting progress");
    await progressRepository.resetProgress(userId, project._id);
  },

  async setCurrentPhase(userId: string, slug: string, phaseId: string) {
    const project = await this.getBySlug(slug);
    const enrollment = await progressRepository.findEnrollment(userId, project._id);
    if (!enrollment) throw new HttpError(403, "Enroll in this project before recording progress");
    const phaseIndex = project.phases.findIndex((phase) => phase.id === phaseId);
    if (phaseIndex < 0) throw new HttpError(404, "Phase not found");
    await progressRepository.setCurrentPhase(userId, project._id, phaseIndex);
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
        difficulty: "Beginner" | "Intermediate" | "Expert"; estimatedHours: number; techStack: string[];
      } | null;
      const canonicalProject = project && canonicalProjectsBySlug.get(project.slug);
      if (!project || !canonicalProject) return null;
      const validPhaseIds = new Set(canonicalProject.phases.map((phase) => phase.id));
      const completed = (await progressRepository.listCompletedPhases(userId, project._id))
        .filter(({ phaseId }) => validPhaseIds.has(phaseId));
      const currentPhaseIndex = canonicalProject.phases.length
        ? Math.min(canonicalProject.phases.length - 1, Math.max(0, enrollment.currentPhaseIndex ?? 0))
        : 0;
      return {
        enrollmentId: enrollment._id,
        enrolledAt: enrollment.enrolledAt,
        currentPhaseIndex,
        completedCount: completed.length,
        totalPhases: canonicalProject.phases.length,
        completedPhases: completed.map(({ phaseId }) => phaseId),
        currentPhaseId: canonicalProject.phases[currentPhaseIndex]?.id ?? null,
        currentPhaseTitle: canonicalProject.phases[currentPhaseIndex]?.title ?? null,
        project: {
          _id: project._id, slug: canonicalProject.slug, title: canonicalProject.title, tagline: canonicalProject.tagline,
          track: canonicalProject.track, difficulty: canonicalProject.difficulty,
          estimatedHours: canonicalProject.estimatedHours, techStack: canonicalProject.techStack,
        },
      };
    })).then((items) => items.filter((item) => item !== null));
  },
};
