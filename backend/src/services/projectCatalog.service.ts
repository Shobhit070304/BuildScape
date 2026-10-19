import fs from "fs";
import path from "path";
import type { IProject } from "../models/Project";
import { Project } from "../models/Project";

function projectFilePath() {
  return path.resolve(__dirname, "../../data/projects.json");
}

export function loadProjectCatalog(): IProject[] {
  const file = projectFilePath();
  if (!fs.existsSync(file)) throw new Error(`Canonical project catalog not found: ${file}`);
  const value: unknown = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(value)) throw new Error("projects.json must contain a project array");

  const validDifficulties = new Set(["Beginner", "Intermediate", "Expert"]);
  const slugs = new Set<string>();
  for (const [projectIndex, item] of value.entries()) {
    if (!item || typeof item !== "object") throw new Error(`Project ${projectIndex + 1} is invalid`);
    const project = item as Record<string, unknown>;
    if (typeof project.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug) || slugs.has(project.slug)) {
      throw new Error(`Project ${projectIndex + 1} has an invalid or duplicate slug`);
    }
    slugs.add(project.slug);
    if (!validDifficulties.has(String(project.difficulty))) throw new Error(`Project ${project.slug} has unsupported difficulty`);
    if (typeof project.title !== "string" || !project.title.trim() || typeof project.tagline !== "string" || !project.tagline.trim()) {
      throw new Error(`Project ${project.slug} has missing title or tagline`);
    }
    if ((project.description !== undefined && typeof project.description !== "string") ||
        (project.whatYouWillLearn !== undefined && (!Array.isArray(project.whatYouWillLearn) || project.whatYouWillLearn.some((value) => typeof value !== "string")))) {
      throw new Error(`Project ${project.slug} has invalid optional content`);
    }
    if (typeof project.track !== "string" || !project.track.trim()) throw new Error(`Project ${project.slug} has no skill track`);
    if ("tasks" in project || "tasksCount" in project || "taskList" in project || "checklist" in project) {
      throw new Error(`Project ${project.slug} must contain phases only, without task lists`);
    }
    if (typeof project.estimatedHours !== "number" || !Number.isFinite(project.estimatedHours) || project.estimatedHours <= 0) throw new Error(`Project ${project.slug} has invalid estimated hours`);
    if (!Array.isArray(project.techStack) || project.techStack.some((value) => typeof value !== "string" || !value.trim()) || !Array.isArray(project.phases) || project.phases.length === 0) {
      throw new Error(`Project ${project.slug} must have a stack and at least one phase`);
    }
    const phaseIds = new Set<string>();
    for (const [phaseIndex, rawPhase] of project.phases.entries()) {
      if (!rawPhase || typeof rawPhase !== "object") throw new Error(`Project ${project.slug} phase ${phaseIndex + 1} is invalid`);
      const phase = rawPhase as Record<string, unknown>;
      if (typeof phase.id !== "string" || !phase.id || phaseIds.has(phase.id)) throw new Error(`Project ${project.slug} has an invalid or duplicate phase id`);
      if (phase.orderIndex !== phaseIndex + 1) throw new Error(`Project ${project.slug} phases must have sequential orderIndex values`);
      if (typeof phase.title !== "string" || !phase.title.trim() || typeof phase.content !== "string" || !phase.content.trim()) {
        throw new Error(`Project ${project.slug} phase content is incomplete`);
      }
      if ("tasks" in phase || "tasksCount" in phase || "taskList" in phase || "checklist" in phase || /\[[ x]\]/i.test(phase.content) || /^##\s+Verification checklist\s*$/im.test(phase.content)) {
        throw new Error(`Project ${project.slug} must contain phase content without task lists`);
      }
      phaseIds.add(phase.id);
    }
  }
  return value as IProject[];
}

export async function syncProjectCatalog() {
  const projects = loadProjectCatalog();
  for (const project of projects) {
    await Project.findOneAndUpdate(
      { slug: project.slug },
      { $set: project },
      { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true }
    );
  }
  return projects;
}
