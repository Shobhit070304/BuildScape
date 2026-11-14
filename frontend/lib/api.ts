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

  getPublicStats: () =>
    request<{
      stats: {
        totalUsers: number;
        totalProjects: number;
        totalEnrollments: number;
        completedEnrollments: number;
      };
    }>("/api/projects/stats/public"),

  getVerifiedShowcases: () =>
    request<{
      showcases: Array<{
        id: string;
        title: string;
        track: string;
        difficulty: "Beginner" | "Intermediate" | "Advanced";
        description: string;
        authorName: string;
        authorHandle: string;
        authorAvatar?: string;
        timeAgo: string;
        repoUrl: string;
        demoUrl?: string;
        projectSlug: string;
        certificateId?: string;
      }>;
    }>("/api/projects/showcases/verified"),

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

  toggleTaskProgress: (slug: string, phaseId: string, taskId: string, completed?: boolean) =>
    request<{ taskId: string; phaseId: string; completed: boolean; completedTasks: string[]; phaseCompleted?: boolean }>(
      `/api/projects/${slug}/phases/${encodeURIComponent(phaseId)}/tasks/${encodeURIComponent(taskId)}/toggle`,
      { method: "POST", body: JSON.stringify({ completed }) }
    ),

  verifyProject: (slug: string, data: { githubRepoUrl: string; liveDemoUrl?: string }) =>
    request<{
      isVerified: boolean;
      certificateId: string;
      verifiedAt: string;
      githubRepoUrl: string;
      liveDemoUrl?: string;
      verificationDetails: {
        commitCount?: number;
        repoOwner?: string;
        repoName?: string;
        fingerprintMatched?: string[];
        verifiedChecks?: string[];
      };
    }>(`/api/projects/${slug}/verify`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getCertificate: (certificateId: string) =>
    request<{ certificate: CertificateData }>(`/api/projects/certificates/${encodeURIComponent(certificateId)}`),

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

  updateProfile: (data: {
    name?: string;
    bio?: string;
    location?: string;
    githubUrl?: string;
    twitterUrl?: string;
    portfolioUrl?: string;
    linkedinUrl?: string;
    skills?: string[];
  }) =>
    request<{ user: AuthUser }>("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getPublicProfile: (username: string) =>
    request<{
      profile: PublicUserProfile;
      stats: PublicUserStats;
      projects: PublicUserProject[];
    }>(`/api/users/${encodeURIComponent(username)}`),

  getUserActivity: (username: string) =>
    request<UserActivityResponse>(`/api/users/${encodeURIComponent(username)}/activity`),

  getGlobalReviews: () =>
    request<GlobalReviewsResponse>("/api/reviews"),

  getMyReview: () =>
    request<MyReviewResponse>("/api/reviews/me"),

  submitReview: (data: { rating: number; headline?: string; comment: string }) =>
    request<{ review: GlobalReviewItem }>("/api/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteReview: () =>
    request<{ success: boolean; message: string }>("/api/reviews", {
      method: "DELETE",
    }),

  getDiscussions: (params?: {
    category?: string;
    projectSlug?: string;
    phaseId?: string;
    authorId?: string;
    sort?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.projectSlug) searchParams.set("projectSlug", params.projectSlug);
    if (params?.phaseId) searchParams.set("phaseId", params.phaseId);
    if (params?.authorId) searchParams.set("authorId", params.authorId);
    if (params?.sort) searchParams.set("sort", params.sort);
    if (params?.q) searchParams.set("q", params.q);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const qs = searchParams.toString();
    return request<{
      discussions: DiscussionItem[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/api/discussions${qs ? `?${qs}` : ""}`);
  },

  getDiscussion: (id: string) =>
    request<{ discussion: DiscussionDetail }>(`/api/discussions/${encodeURIComponent(id)}`),

  createDiscussion: (data: {
    title: string;
    content: string;
    category?: string;
    projectSlug?: string;
    phaseId?: string;
  }) =>
    request<{ discussion: DiscussionDetail }>("/api/discussions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteDiscussion: (id: string) =>
    request<{ success: boolean }>(`/api/discussions/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  toggleUpvoteDiscussion: (id: string) =>
    request<{ hasUpvoted: boolean; upvoteCount: number }>(`/api/discussions/${encodeURIComponent(id)}/upvote`, {
      method: "POST",
    }),

  getDiscussionComments: (discussionId: string) =>
    request<{ comments: DiscussionCommentItem[] }>(`/api/discussions/${encodeURIComponent(discussionId)}/comments`),

  createComment: (discussionId: string, data: { content: string; parentId?: string }) =>
    request<{ comment: DiscussionCommentItem }>(`/api/discussions/${encodeURIComponent(discussionId)}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  toggleUpvoteComment: (discussionId: string, commentId: string) =>
    request<{ hasUpvoted: boolean; upvoteCount: number }>(
      `/api/discussions/${encodeURIComponent(discussionId)}/comments/${encodeURIComponent(commentId)}/upvote`,
      { method: "POST" }
    ),

  acceptCommentSolution: (discussionId: string, commentId: string) =>
    request<{ isResolved: boolean; acceptedCommentId: string }>(
      `/api/discussions/${encodeURIComponent(discussionId)}/comments/${encodeURIComponent(commentId)}/accept`,
      { method: "POST" }
    ),

  deleteComment: (discussionId: string, commentId: string) =>
    request<{ success: boolean }>(
      `/api/discussions/${encodeURIComponent(discussionId)}/comments/${encodeURIComponent(commentId)}`,
      { method: "DELETE" }
    ),

  // Admin Portal endpoints
  getAdminOverview: () =>
    request<{
      stats: {
        totalUsers: number;
        totalEnrollments: number;
        totalProjects: number;
        totalDiscussions: number;
        openIssuesCount: number;
      };
    }>("/api/admin/overview"),

  getAdminUsers: (params?: { q?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.set("q", params.q);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const qs = searchParams.toString();
    return request<{
      users: AdminUserItem[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/api/admin/users${qs ? `?${qs}` : ""}`);
  },

  toggleAdminUserRole: (userId: string, role: "user" | "admin") =>
    request<{ success: boolean; user: AdminUserItem }>(`/api/admin/users/${encodeURIComponent(userId)}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  getAdminDiscussions: (params?: { category?: string; q?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.q) searchParams.set("q", params.q);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const qs = searchParams.toString();
    return request<{
      discussions: AdminDiscussionItem[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/api/admin/discussions${qs ? `?${qs}` : ""}`);
  },

  deleteAdminDiscussion: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/admin/discussions/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};

// Shared types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  githubUrl?: string;
  twitterUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  skills?: string[];
  role?: "user" | "admin";
}

export type DiscussionCategory = "general" | "question" | "showcase" | "architecture" | "tip";

export interface DiscussionAuthor {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
}

export interface DiscussionItem {
  id: string;
  title: string;
  content: string;
  category: DiscussionCategory;
  projectSlug?: string;
  projectTitle?: string;
  phaseId?: string;
  phaseTitle?: string;
  upvoteCount: number;
  replyCount: number;
  views: number;
  isResolved: boolean;
  hasUpvoted: boolean;
  author: DiscussionAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionDetail extends DiscussionItem {
  acceptedCommentId?: string | null;
}

export interface DiscussionCommentItem {
  id: string;
  discussionId: string;
  content: string;
  parentId?: string | null;
  upvoteCount: number;
  isAcceptedSolution: boolean;
  hasUpvoted: boolean;
  author: DiscussionAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUserProfile {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  location?: string;
  githubUrl?: string;
  twitterUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  skills: string[];
  createdAt: string;
}

export interface PublicUserStats {
  completedProjectsCount: number;
  enrolledProjectsCount: number;
  discussionsCount: number;
  solutionsCount: number;
}

export interface PublicUserProject {
  title: string;
  slug: string;
  shortDescription: string;
  track: string;
  difficulty: string;
  estimatedHours: number;
  techStack: string[];
  icon?: string;
  isCompleted: boolean;
  completedAt?: string;
  enrolledAt: string;
  githubRepoUrl?: string;
  liveDemoUrl?: string;
}

export interface EnrolledProjectItem {
  enrollmentId: string;
  enrolledAt: string;
  completedAt?: string;
  isVerified?: boolean;
  verifiedAt?: string;
  certificateId?: string;
  githubRepoUrl?: string;
  liveDemoUrl?: string;
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
  isVerified?: boolean;
  verifiedAt?: string;
  certificateId?: string;
  githubRepoUrl?: string;
  liveDemoUrl?: string;
  completedPhases: { phaseId: string; completedAt: string }[];
  completedTasks?: Record<string, string[]>;
}

export interface CertificateData {
  certificateId: string;
  verifiedAt: string;
  githubRepoUrl: string;
  liveDemoUrl?: string;
  verificationDetails?: {
    commitCount?: number;
    repoOwner?: string;
    repoName?: string;
    fingerprintMatched?: string[];
    verifiedChecks?: string[];
  };
  recipient: {
    name: string;
    username?: string;
    avatar?: string;
  };
  project: {
    slug: string;
    title: string;
    tagline: string;
    track: string;
    difficulty: string;
    estimatedHours: number;
    techStack: string[];
    deliverable?: string;
    phaseCount: number;
  };
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

export interface AdminUserItem {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  bio?: string;
  location?: string;
  skills: string[];
  createdAt: string;
  enrolledCount: number;
  completedCount: number;
}

export interface AdminDiscussionItem {
  id: string;
  title: string;
  category: DiscussionCategory;
  projectSlug?: string;
  projectTitle?: string;
  upvoteCount: number;
  replyCount: number;
  views: number;
  isResolved: boolean;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface UserActivityDay {
  date: string;
  count: number;
  level: number;
}

export interface UserActivityResponse {
  calendar: UserActivityDay[];
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
}

export interface GlobalReviewItem {
  id: string;
  rating: number;
  headline: string;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    githubUrl?: string;
  };
}

export interface GlobalReviewsResponse {
  reviews: GlobalReviewItem[];
  stats: {
    averageRating: number;
    totalReviews: number;
  };
}

export interface MyReviewResponse {
  review: {
    id: string;
    rating: number;
    headline: string;
    comment: string;
    createdAt: string;
    updatedAt: string;
  } | null;
}
