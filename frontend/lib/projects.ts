import projectsData from "@/data/projects.json";

export interface Phase {
  id: string;
  orderIndex: number;
  title: string;
  content: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  track: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  techStack: string[];
  phases: Phase[];
}

const projects = projectsData as Project[];

export function getAllProjects(): Project[] {
  return projects;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAllTracks(): string[] {
  return Array.from(new Set(projects.map((p) => p.track))).sort();
}

export const DIFFICULTY_ORDER = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "text-emerald-400 bg-emerald-950/60 border-emerald-900",
  Intermediate: "text-amber-400 bg-amber-950/60 border-amber-900",
  Advanced: "text-rose-400 bg-rose-950/60 border-rose-900",
};

export const TRACK_COLORS: Record<string, string> = {
  "Next.js": "text-sky-300 bg-sky-950/50 border-sky-900",
  "Node.js": "text-lime-300 bg-lime-950/50 border-lime-900",
  React: "text-cyan-300 bg-cyan-950/50 border-cyan-900",
  Python: "text-yellow-300 bg-yellow-950/50 border-yellow-900",
  "Go": "text-teal-300 bg-teal-950/50 border-teal-900",
  default: "text-stone-300 bg-stone-800/50 border-stone-700",
};

export function getTrackColor(track: string): string {
  return TRACK_COLORS[track] ?? TRACK_COLORS.default;
}
