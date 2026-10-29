import { Types } from "mongoose";
import { feedbackRepository } from "../repositories/feedback.repository";
import { progressRepository } from "../repositories/progress.repository";
import { projectRepository } from "../repositories/projects.repository";
import { HttpError } from "./httpError";

const categories = ["outdated", "broken", "unclear", "other"] as const;
const statuses = ["open", "in_review", "resolved"] as const;

export const feedbackService = {
  async getPhaseContext(userId: string, slug: string, phaseId: string) {
    const project = await projectRepository.findPhasesBySlug(slug);
    if (!project) throw new HttpError(404, "Project not found");
    if (!project.phases.some((phase) => phase.id === phaseId)) throw new HttpError(404, "Phase not found");
    if (!await progressRepository.findEnrollment(userId, project._id)) {
      throw new HttpError(403, "Enroll in this project to use phase notes and reports");
    }
    return project;
  },

  async getNote(userId: string, slug: string, phaseId: string) {
    const project = await this.getPhaseContext(userId, slug, phaseId);
    const note = await feedbackRepository.getNote(userId, project._id, phaseId);
    return note?.content ?? "";
  },

  async saveNote(userId: string, slug: string, phaseId: string, value: unknown) {
    const project = await this.getPhaseContext(userId, slug, phaseId);
    if (typeof value !== "string") throw new HttpError(400, "Note content must be text");
    if (value.length > 10000) throw new HttpError(400, "Notes must be 10,000 characters or fewer");
    if (!value.trim()) {
      await feedbackRepository.deleteNote(userId, project._id, phaseId);
      return "";
    }
    await feedbackRepository.saveNote(userId, project._id, phaseId, value);
    return value;
  },

  async reportIssue(userId: string, slug: string, phaseId: string, input: unknown) {
    const project = await this.getPhaseContext(userId, slug, phaseId);
    if (!input || typeof input !== "object") throw new HttpError(400, "Issue details are required");
    const { category, message } = input as Record<string, unknown>;
    if (typeof category !== "string" || !categories.includes(category as typeof categories[number])) {
      throw new HttpError(400, "Choose a valid issue category");
    }
    if (typeof message !== "string" || !message.trim() || message.trim().length > 2000) {
      throw new HttpError(400, "Describe the issue in 1–2,000 characters");
    }
    const phaseTitle = project.phases.find((phase) => phase.id === phaseId)!.title;
    return feedbackRepository.createIssue({
      userId, projectId: project._id, phaseId, phaseTitle, category: category as typeof categories[number], message: message.trim(),
    });
  },

  async listIssues(status: unknown) {
    if (status !== undefined && (typeof status !== "string" || !statuses.includes(status as typeof statuses[number]))) {
      throw new HttpError(400, "Choose a valid issue status");
    }
    return feedbackRepository.listIssues(status as typeof statuses[number] | undefined);
  },

  async updateIssueStatus(id: string, status: unknown) {
    if (!Types.ObjectId.isValid(id)) throw new HttpError(404, "Issue not found");
    if (typeof status !== "string" || !statuses.includes(status as typeof statuses[number])) {
      throw new HttpError(400, "Choose a valid issue status");
    }
    const issue = await feedbackRepository.updateIssueStatus(new Types.ObjectId(id), status as typeof statuses[number]);
    if (!issue) throw new HttpError(404, "Issue not found");
    return issue;
  },
};
