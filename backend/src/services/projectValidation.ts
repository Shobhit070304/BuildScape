import type { IProject } from "../models/Project";
import { HttpError } from "./httpError";

const difficulties = new Set(["Beginner", "Intermediate", "Advanced"]);

function requiredText(value: unknown, field: string, maxLength: number): asserts value is string {
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    throw new HttpError(400, `${field} is required and must be at most ${maxLength} characters`);
  }
}

function optionalTextList(value: unknown, field: string): void {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim() || item.length > 200)) {
    throw new HttpError(400, `${field} must be a list of non-empty strings (200 characters max each)`);
  }
}

/** Validate the complete project shape used by the admin editor before persistence. */
export function validateProjectInput(value: unknown): asserts value is IProject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, "Project data must be an object");
  }

  const project = value as Record<string, unknown>;
  requiredText(project.slug, "Slug", 64);
  if (project.slug !== (project.slug as string).trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug as string)) {
    throw new HttpError(400, "Slug must use lowercase letters, numbers, and single hyphens");
  }
  requiredText(project.title, "Title", 120);
  requiredText(project.tagline, "Tagline", 240);
  requiredText(project.track, "Track", 80);

  if (typeof project.difficulty !== "string" || !difficulties.has(project.difficulty)) {
    throw new HttpError(400, "Choose a valid project difficulty");
  }
  if (typeof project.estimatedHours !== "number" || !Number.isFinite(project.estimatedHours) || project.estimatedHours < 1 || project.estimatedHours > 5000) {
    throw new HttpError(400, "Estimated hours must be between 1 and 5000");
  }
  if (project.description !== undefined && (typeof project.description !== "string" || project.description.length > 20000)) {
    throw new HttpError(400, "Description must be at most 20000 characters");
  }
  optionalTextList(project.whatYouWillLearn, "What you will learn");
  if (!Array.isArray(project.techStack) || project.techStack.length === 0 || project.techStack.length > 30) {
    throw new HttpError(400, "Add between 1 and 30 technologies");
  }
  optionalTextList(project.techStack, "Tech stack");

  if (!Array.isArray(project.phases) || project.phases.length === 0 || project.phases.length > 40) {
    throw new HttpError(400, "Add between 1 and 40 phases");
  }

  const phaseIds = new Set<string>();
  project.phases.forEach((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new HttpError(400, `Phase ${index + 1} must be an object`);
    }
    const phase = item as Record<string, unknown>;
    requiredText(phase.id, `Phase ${index + 1} ID`, 64);
    if (phase.id !== (phase.id as string).trim() || !/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/.test(phase.id as string) || phaseIds.has(phase.id as string)) {
      throw new HttpError(400, `Phase ${index + 1} ID must be unique and use letters, numbers, and hyphens`);
    }
    phaseIds.add(phase.id as string);
    if (phase.orderIndex !== index + 1) {
      throw new HttpError(400, `Phase ${index + 1} order must be ${index + 1}`);
    }
    requiredText(phase.title, `Phase ${index + 1} title`, 160);
    requiredText(phase.content, `Phase ${index + 1} content`, 100000);
  });

  // The checks above establish the shape; Mongoose still applies the persisted schema.
}
