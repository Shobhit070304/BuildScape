import projectsData from "@/data/projects.json";

export interface Phase {
  id: string;
  orderIndex: number;
  title: string;
  content: string;
}

export type ProjectDifficulty = "Entry" | "Basic" | "Intermediate" | "Advanced" | "Expert" | "Beginner";

export interface Project {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description?: string;
  whatYouWillLearn?: string[];
  track: string;
  difficulty: ProjectDifficulty;
  estimatedHours: number;
  techStack: string[];
  phases: Phase[];
}

const localProjects = projectsData as Project[];

export function getAllProjects(): Project[] {
  return localProjects;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return localProjects.find((p) => p.slug === slug);
}

/**
 * Fetch all projects from MongoDB API with automatic fallback to local data.
 */
export async function fetchProjectsFromDb(): Promise<Project[]> {
  try {
    const res = await fetch(`${process.env.API_URL}/api/projects`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
      return data.projects.map((p: any) => ({
        id: p._id || p.id || p.slug,
        slug: p.slug,
        title: p.title,
        tagline: p.tagline,
        description: p.description,
        whatYouWillLearn: p.whatYouWillLearn,
        track: p.track,
        difficulty: p.difficulty,
        estimatedHours: p.estimatedHours,
        techStack: p.techStack || [],
        phases: p.phases || [],
      }));
    }
  } catch (err) {
    console.warn("⚠️ [BuildScape] Could not load projects from DB API, using local fallback.", err);
  }
  return getAllProjects();
}


/**
 * Fetch a single project with full phase content from MongoDB API with automatic fallback.
 */
export async function fetchProjectBySlugFromDb(slug: string): Promise<Project | undefined> {
  try {
    const res = await fetch(`${process.env.API_URL}/api/projects/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.project) {
      const p = data.project;
      return {
        id: p._id || p.id || p.slug,
        slug: p.slug,
        title: p.title,
        tagline: p.tagline,
        description: p.description,
        whatYouWillLearn: p.whatYouWillLearn,
        track: p.track,
        difficulty: p.difficulty,
        estimatedHours: p.estimatedHours,
        techStack: p.techStack || [],
        phases: p.phases || [],
      };
    }
  } catch (err) {
    console.warn(`⚠️ [BuildScape] Could not load project "${slug}" from DB API, using local fallback.`);
  }
  return getProjectBySlug(slug);
}

export function getAllTracks(): string[] {
  const primaryTechs = [
    "Web Development",
    "Full-Stack SpringBoot",
    "Machine Learning",
    "React & Node.js",
    "C++",
    "Python",
    "Ethereum dApps",
    "Rust",
    "Golang",
    "Java",
    "C Language",
    "Next.js",
    "C#",
    "Node.js"
  ];
  const dynamicTracks = Array.from(new Set(localProjects.map((p) => p.track)));
  return Array.from(new Set([...primaryTechs, ...dynamicTracks]));
}

export const DIFFICULTY_ORDER: Record<string, number> = {
  Entry: 0,
  Basic: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4,
  Beginner: 1,
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  Entry: "text-sky-400 bg-sky-950/50 border-sky-800/60",
  Basic: "text-emerald-400 bg-emerald-950/50 border-emerald-800/60",
  Intermediate: "text-amber-400 bg-amber-950/50 border-amber-800/60",
  Advanced: "text-rose-400 bg-rose-950/50 border-rose-800/60",
  Expert: "text-purple-400 bg-purple-950/50 border-purple-800/60",
  Beginner: "text-emerald-400 bg-emerald-950/50 border-emerald-800/60",
};

export const TRACK_COLORS: Record<string, string> = {
  "Next.js": "text-zinc-100 bg-zinc-900/90 border-zinc-700",
  "Node.js": "text-emerald-400 bg-emerald-950/60 border-emerald-800",
  Python: "text-amber-300 bg-amber-950/50 border-amber-800",
  React: "text-cyan-300 bg-cyan-950/50 border-cyan-900",
  TypeScript: "text-sky-300 bg-sky-950/50 border-sky-900",
  PostgreSQL: "text-cyan-400 bg-cyan-950/50 border-cyan-900",
  Redis: "text-rose-400 bg-rose-950/50 border-rose-900",
  default: "text-stone-300 bg-stone-800/50 border-stone-700",
};

export function getTrackColor(track: string): string {
  return TRACK_COLORS[track] ?? TRACK_COLORS.default;
}

export function getPhaseDescription(phase: Phase): string {
  if (!phase.content) return "";
  const match = phase.content.match(/What You Will Accomplish\s*\n+([\s\S]*?)(?=\n+---|\n+##|$)/i);
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
