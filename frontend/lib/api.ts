export function getApiUrl(): string {
  // Changed from process.env.API_URL to process.env.NEXT_PUBLIC_API_URL
  const url =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000";
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
    request<{ user: AuthUser }>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),

  logout: () =>
    request<{ success: boolean; message: string }>("/api/auth/logout", {
      method: "POST",
    }),

  getMe: () => request<{ user: AuthUser }>("/api/auth/me"),

  // Projects
  getProjects: () =>
    request<{ projects: ApiProject[] }>("/api/projects", { cache: "force-cache" }),

  getProject: (slug: string) =>
    request<{ project: ApiProject }>(`/api/projects/${encodeURIComponent(slug)}`),

  enrollProject: (slug: string) =>
    request<{ enrollment: unknown }>(`/api/projects/${encodeURIComponent(slug)}/enroll`, {
      method: "POST",
    }),

  getProgress: (slug: string) =>
    request<ProgressResponse>(`/api/projects/${encodeURIComponent(slug)}/progress`),

  completePhase: (slug: string, phaseId: string) =>
    request<{ success: boolean }>(
      `/api/projects/${encodeURIComponent(slug)}/phases/${encodeURIComponent(phaseId)}/complete`,
      { method: "POST" }
    ),

  uncompletePhase: (slug: string, phaseId: string) =>
    request<{ success: boolean }>(
      `/api/projects/${encodeURIComponent(slug)}/phases/${encodeURIComponent(phaseId)}/complete`,
      { method: "DELETE" }
    ),

  setCurrentPhase: (slug: string, phaseId: string) =>
    request<{ success: boolean }>(
      `/api/projects/${encodeURIComponent(slug)}/phases/${encodeURIComponent(phaseId)}/current`,
      { method: "PUT" }
    ),

  streamProjectAIHelp: async (
    slug: string,
    phaseId: string,
    messages: AIChatMessage[],
    onChunk: (text: string) => void,
  ) => {
    const response = await fetch(`${getApiUrl()}/api/projects/${encodeURIComponent(slug)}/ai-help`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({ phaseId, messages }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(err.message ?? err.error ?? "Request failed");
    }
    if (!response.body) throw new Error("Streaming is not available in this browser.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        let boundary = buffer.indexOf("\n\n");
        while (boundary >= 0) {
          const event = buffer.slice(0, boundary).trim();
          buffer = buffer.slice(boundary + 2);
          const data = event.split("\n").find((line) => line.startsWith("data:"))?.slice(5).trim();
          if (data) {
            const payload = JSON.parse(data) as { text?: string; error?: string };
            if (payload.error) throw new Error(payload.error);
            if (payload.text) onChunk(payload.text);
          }
          boundary = buffer.indexOf("\n\n");
        }
        if (done) break;
      }
    } finally {
      reader.releaseLock();
    }
  },

  getEnrolledProjects: () =>
    request<{ enrollments: EnrolledProjectItem[] }>("/api/projects/my/enrolled"),

};

// Shared types
export type ProjectDifficulty = "Beginner" | "Intermediate" | "Expert";

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
}

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
  currentPhaseId: string | null;
  currentPhaseTitle: string | null;
  completedCount: number;
  totalPhases: number;
  completedPhases: string[];
  project: {
    _id: string;
    slug: string;
    title: string;
    tagline: string;
    track: string;
    difficulty: ProjectDifficulty;
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
  difficulty: ProjectDifficulty;
  estimatedHours: number;
  techStack: string[];
  phases?: ApiPhase[];
  enrolledUsersCount?: number;
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
