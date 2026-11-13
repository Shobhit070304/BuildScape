import type { ApiProject } from "@/lib/api";
import { getApiUrl } from "@/lib/api";

export interface Phase {
  id: string;
  orderIndex: number;
  title: string;
  summary?: string;
  tasks?: { id: string; title: string }[];
  estimatedMinutes?: number;
  content: string;
}

export type ProjectDifficulty = "Beginner" | "Intermediate" | "Advanced";

/** Translate older database labels while existing records are migrated. */
export function normalizeDifficulty(value: string): ProjectDifficulty {
  if (value === "Entry" || value === "Basic") return "Beginner";
  if (value === "Expert") return "Advanced";
  if (value === "Beginner" || value === "Intermediate" || value === "Advanced") return value;
  return "Beginner";
}

export interface Project {
  id: string;
  learnerCount?: number;
  slug: string;
  title: string;
  tagline: string;
  description?: string;
  category?: string;
  whatYouWillLearn?: string[];
  prerequisites?: string[];
  deliverable?: string;
  isPublished?: boolean;
  track: string;
  difficulty: ProjectDifficulty;
  estimatedHours: number;
  techStack: string[];
  phases: Phase[];
}

/**
 * Map a raw API project document to the local Project shape.
 */
export function mapApiProject(p: ApiProject): Project {
  return {
    id: p._id ?? p.slug,
    learnerCount: p.learnerCount,
    slug: p.slug,
    title: p.title,
    tagline: p.tagline,
    description: p.description,
    category: p.category,
    whatYouWillLearn: p.whatYouWillLearn,
    prerequisites: p.prerequisites,
    deliverable: p.deliverable,
    isPublished: p.isPublished,
    track: p.track,
    difficulty: normalizeDifficulty(p.difficulty),
    estimatedHours: p.estimatedHours,
    techStack: p.techStack ?? [],
    phases: (p.phases ?? []) as Phase[],
  };
}

/**
 * Fetch all projects from MongoDB API.
 */
export async function fetchProjectsFromDb(): Promise<Project[]> {
  const apiUrl = getApiUrl();
  try {
    const res = await fetch(`${apiUrl}/api/projects`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
      return (data.projects as ApiProject[]).map(mapApiProject);
    }
  } catch (err) {
    console.warn("⚠️ [BuildScape] Could not load projects from DB API.", err);
  }
  return [];
}

/**
 * Fetch a single project with full phase content from MongoDB API.
 */
export async function fetchProjectBySlugFromDb(slug: string): Promise<Project | undefined> {
  const apiUrl = getApiUrl();
  try {
    const res = await fetch(`${apiUrl}/api/projects/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.project) {
      return mapApiProject(data.project as ApiProject);
    }
  } catch (err) {
    console.warn(`⚠️ [BuildScape] Could not load project "${slug}" from DB API.`, err);
  }
  return undefined;
}

export const DIFFICULTY_ORDER: Record<string, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "text-neutral-300 bg-white/[0.04] border-white/10",
  Intermediate: "text-neutral-300 bg-white/[0.04] border-white/10",
  Advanced: "text-neutral-200 bg-white/[0.06] border-white/15",
};

export const TRACK_COLORS: Record<string, string> = {
  "Next.js": "text-neutral-200 bg-white/[0.04] border-white/10",
  "Node.js": "text-neutral-200 bg-white/[0.04] border-white/10",
  Python: "text-neutral-200 bg-white/[0.04] border-white/10",
  React: "text-neutral-200 bg-white/[0.04] border-white/10",
  TypeScript: "text-neutral-200 bg-white/[0.04] border-white/10",
  PostgreSQL: "text-neutral-200 bg-white/[0.04] border-white/10",
  Redis: "text-neutral-200 bg-white/[0.04] border-white/10",
  default: "text-neutral-300 bg-white/[0.04] border-white/10",
};

export function getTrackColor(track: string): string {
  return TRACK_COLORS[track] ?? TRACK_COLORS.default;
}

export function getPhaseDescription(phase: Phase): string {
  if (!phase.content) return "";
  const match = phase.content.match(/What You Will Accomplish\s*\n+([\s\S]*?)(?=\n+---|\\n+##|$)/i);
  if (match && match[1]) {
    return match[1]
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\n+/g, " ")
      .trim();
  }
  const lines = phase.content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("-") &&
      !trimmed.startsWith("```") &&
      !trimmed.startsWith("---")
    ) {
      return trimmed
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1");
    }
  }
  return phase.title;
}
