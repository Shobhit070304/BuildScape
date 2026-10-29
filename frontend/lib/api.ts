export function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!url) throw new Error("NEXT_PUBLIC_API_URL is required");
  return url.replace(/\/+$/, "");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const apiUrl = getApiUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${apiUrl}${cleanPath}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
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

  logout: () =>
    request<{ success: boolean; message: string }>("/api/auth/logout", {
      method: "POST",
    }),

  getMe: () => request<{ user: AuthUser }>("/api/auth/me"),

  updateUsername: (username: string) =>
    request<{ username: string }>("/api/auth/username", {
      method: "PUT",
      body: JSON.stringify({ username }),
    }),

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

  clearProgress: (slug: string) =>
    request<{ success: boolean }>(`/api/projects/${slug}/progress`, { method: "DELETE" }),

  setActivePhase: (slug: string, phaseId: string) =>
    request<{ success: boolean; currentPhaseIndex: number }>(`/api/projects/${slug}/progress/active-phase`, {
      method: "PUT", body: JSON.stringify({ phaseId }),
    }),

  getPhaseNote: (slug: string, phaseId: string) =>
    request<{ content: string }>(`/api/projects/${slug}/phases/${encodeURIComponent(phaseId)}/note`),

  savePhaseNote: (slug: string, phaseId: string, content: string) =>
    request<{ success: boolean; content: string }>(`/api/projects/${slug}/phases/${encodeURIComponent(phaseId)}/note`, {
      method: "PUT", body: JSON.stringify({ content }),
    }),

  reportPhaseIssue: (slug: string, phaseId: string, data: { category: CurriculumIssueCategory; message: string }) =>
    request<{ success: boolean; issue: AdminCurriculumIssue }>(`/api/projects/${slug}/phases/${encodeURIComponent(phaseId)}/issues`, {
      method: "POST", body: JSON.stringify(data),
    }),

  getCurriculumIssues: (status?: CurriculumIssueStatus) =>
    request<{ issues: AdminCurriculumIssue[] }>(`/api/admin/curriculum-issues${status ? `?status=${status}` : ""}`),

  updateCurriculumIssue: (id: string, status: CurriculumIssueStatus) =>
    request<{ success: boolean; issue: AdminCurriculumIssue }>(`/api/admin/curriculum-issues/${id}`, {
      method: "PATCH", body: JSON.stringify({ status }),
    }),

  completePhase: (slug: string, phaseId: string) =>
    request<{ success: boolean }>(
      `/api/projects/${slug}/phases/${phaseId}/complete`,
      { method: "POST" }
    ),

  uncompletePhase: (slug: string, phaseId: string) =>
    request<{ success: boolean }>(
      `/api/projects/${slug}/phases/${phaseId}/complete`,
      { method: "DELETE" }
    ),

  getEnrolledProjects: () =>
    request<{ enrollments: EnrolledProjectItem[] }>("/api/projects/my/enrolled"),

  createProject: (project: ProjectPayload) =>
    request<{ success: boolean; project: ApiProject }>("/api/projects", {
      method: "POST",
      body: JSON.stringify(project),
    }),

  updateProject: (slug: string, project: ProjectPayload) =>
    request<{ success: boolean; project: ApiProject }>(`/api/projects/${encodeURIComponent(slug)}`, {
      method: "PUT",
      body: JSON.stringify(project),
    }),

  deleteProject: (slug: string) =>
    request<{ success: boolean; message: string }>(`/api/projects/${encodeURIComponent(slug)}`, {
      method: "DELETE",
    }),

  verifyProject: (slug: string, data: { githubRepoUrl: string; liveDemoUrl?: string }) =>
    request<{ success: boolean; verification: unknown }>(`/api/projects/${slug}/verify`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getPublicProfile: (username: string) =>
    request<PublicUserProfile>(`/api/users/${username}`),
};

// Shared types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  username?: string;
  avatar?: string;
  role?: "user" | "admin";
}

export interface EnrolledProjectItem {
  enrollmentId: string;
  enrolledAt: string;
  completedAt?: string;
  currentPhaseIndex: number;
  completedCount: number;
  totalPhases: number;
  completedPhases: string[];
  isVerified?: boolean;
  githubRepoUrl?: string;
  liveDemoUrl?: string;
  verifiedAt?: string;
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

export interface ProjectPayload {
  slug: string;
  title: string;
  tagline: string;
  description?: string;
  whatYouWillLearn?: string[];
  track: string;
  difficulty: string;
  estimatedHours: number;
  techStack: string[];
  phases: { id: string; orderIndex: number; title: string; content: string }[];
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
  completedAt?: string;
  completedPhases: { phaseId: string; completedAt: string }[];
  isVerified?: boolean;
  githubRepoUrl?: string;
  liveDemoUrl?: string;
  verifiedAt?: string;
}

export type CurriculumIssueCategory = "outdated" | "broken" | "unclear" | "other";
export type CurriculumIssueStatus = "open" | "in_review" | "resolved";

export interface AdminCurriculumIssue {
  _id: string;
  phaseId: string;
  phaseTitle: string;
  category: CurriculumIssueCategory;
  message: string;
  status: CurriculumIssueStatus;
  createdAt: string;
  updatedAt: string;
  projectId: { _id: string; slug: string; title: string };
  userId: { _id: string; name: string; username?: string };
}

export interface PublicVerifiedProject {
  slug: string;
  title: string;
  tagline: string;
  track: string;
  difficulty: string;
  estimatedHours: number;
  techStack: string[];
  githubRepoUrl?: string;
  liveDemoUrl?: string;
  verifiedAt?: string;
}

export interface PublicUserProfile {
  user: {
    name: string;
    username: string;
    avatar?: string;
    createdAt?: string;
  };
  stats: {
    verifiedBuildsCount: number;
    totalEngineeringHours: number;
    masteredTechStack: string[];
  };
  verifiedProjects: PublicVerifiedProject[];
}
