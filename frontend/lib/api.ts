const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bs_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? err.error ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  googleLogin: (credential: string) =>
    request<{ token: string; user: AuthUser }>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),

  getMe: () => request<{ user: AuthUser }>("/api/auth/me"),

  // Projects
  getProjects: () =>
    request<{ projects: ApiProject[] }>("/api/projects"),

  getProject: (slug: string) =>
    request<{ project: ApiProject }>(`/api/projects/${slug}`),

  enrollProject: (slug: string) =>
    request<{ enrollment: unknown }>(`/api/projects/${slug}/enroll`, {
      method: "POST",
    }),

  getProgress: (slug: string) =>
    request<ProgressResponse>(`/api/projects/${slug}/progress`),

  completePhase: (slug: string, phaseId: string) =>
    request<{ success: boolean }>(
      `/api/projects/${slug}/phases/${phaseId}/complete`,
      { method: "POST" }
    ),

  getEnrolledProjects: () =>
    request<{ enrollments: EnrolledProjectItem[] }>("/api/projects/my/enrolled"),
};

// Shared types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface EnrolledProjectItem {
  enrollmentId: string;
  enrolledAt: string;
  currentPhaseIndex: number;
  completedCount: number;
  totalPhases: number;
  completedPhases: string[];
  project: {
    _id: string;
    slug: string;
    title: string;
    tagline: string;
    track: string;
    difficulty: string;
    estimatedHours: number;
    techStack: string[];
  };
}

export interface ApiProject {
  _id: string;
  slug: string;
  title: string;
  tagline: string;
  description?: string;
  whatYouWillLearn?: string[];
  track: string;
  difficulty: string;
  estimatedHours: number;
  techStack: string[];
  phases?: ApiPhase[];
}

export interface ApiPhase {
  id: string;
  orderIndex: number;
  title: string;
  content?: string;
}

export interface ProgressResponse {
  enrolled: boolean;
  currentPhaseIndex: number;
  completedPhases: { phaseId: string; completedAt: string }[];
}
