export function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!url) throw new Error("NEXT_PUBLIC_API_URL is required");
  return url.replace(/\/+$/, "");
}

export interface AssistantChatMessage {
  role: "user" | "assistant";
  text: string;
}

export async function streamAssistantChat(
  projectSlug: string,
  phaseId: string,
  message: string,
  onDelta: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 60_000);
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener("abort", abortFromCaller, { once: true });

  try {
    const response = await fetch(`${getApiUrl()}/api/assistant/chat`, {
      method: "POST",
      credentials: "include",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({ projectSlug, phaseId, message }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message ?? error.error ?? "Assistant request failed");
    }
    if (!response.body) throw new Error("Streaming is not supported by this browser");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finished = false;
    const handleEvent = (event: string) => {
      const dataLine = event.split("\n").find((line) => line.startsWith("data:"));
      if (!dataLine) return;
      const data = JSON.parse(dataLine.slice(5).trim()) as { type: string; text?: string; message?: string };
      if (data.type === "delta" && data.text) onDelta(data.text);
      if (data.type === "error") throw new Error(data.message || "Assistant request failed");
      if (data.type === "done") finished = true;
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: !done }).replaceAll("\r\n", "\n");
        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          handleEvent(buffer.slice(0, boundary));
          buffer = buffer.slice(boundary + 2);
          boundary = buffer.indexOf("\n\n");
        }
        if (done) break;
      }
      if (buffer.trim()) handleEvent(buffer);
      if (!finished) throw new Error("The assistant connection ended before completing the answer.");
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    if (timedOut) throw new Error("The assistant timed out. Please try again.");
    if (signal?.aborted) throw new Error("Assistant request cancelled");
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const apiUrl = getApiUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(`${apiUrl}${cleanPath}`, {
      ...options,
      signal: options.signal ?? controller.signal,
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

    return await res.json() as T;
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("The server took too long to respond. Check your connection and try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  // Auth
  googleLogin: (credential: string) =>
    request<{ user: AuthUser }>("/api/auth/google", {
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

  getMyIssues: () =>
    request<{ issues: UserReportedIssue[] }>("/api/projects/my/issues"),

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

  getAssistantHistory: (projectSlug: string, phaseId: string) =>
    request<{ messages: AssistantChatMessage[] }>(`/api/assistant/history/${encodeURIComponent(projectSlug)}/${encodeURIComponent(phaseId)}`),

  clearAssistantHistory: (projectSlug: string, phaseId: string) =>
    request<{ success: boolean }>(`/api/assistant/history/${encodeURIComponent(projectSlug)}/${encodeURIComponent(phaseId)}`, { method: "DELETE" }),
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
  category?: string;
  whatYouWillLearn?: string[];
  prerequisites?: string[];
  deliverable?: string;
  track: string;
  difficulty: string;
  estimatedHours: number;
  techStack: string[];
  phases: { id: string; orderIndex: number; title: string; summary?: string; tasks?: { id: string; title: string }[]; estimatedMinutes?: number; content: string }[];
}

export interface ApiPhase {
  id: string;
  orderIndex: number;
  title: string;
  summary?: string;
  tasks?: { id: string; title: string }[];
  estimatedMinutes?: number;
  content?: string;
}

export interface ProgressResponse {
  enrolled: boolean;
  currentPhaseIndex: number;
  completedAt?: string;
  completedPhases: { phaseId: string; completedAt: string }[];
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

export interface UserReportedIssue {
  _id: string;
  phaseId: string;
  phaseTitle: string;
  category: CurriculumIssueCategory;
  message: string;
  status: CurriculumIssueStatus;
  createdAt: string;
  updatedAt?: string;
  projectId?: { _id: string; slug: string; title: string } | null;
}
