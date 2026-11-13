"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowDown, ArrowLeft, ArrowUp, Eye, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { ApiProject, ProjectPayload } from "@/lib/api";
import { normalizeDifficulty } from "@/lib/projects";

type ProjectDraft = ProjectPayload;

const emptyProject = (): ProjectDraft => ({
  slug: "",
  title: "",
  tagline: "",
  description: "",
  whatYouWillLearn: [],
  track: "",
  difficulty: "Beginner",
  estimatedHours: 1,
  techStack: [],
  phases: [{ id: "phase-1", orderIndex: 1, title: "", content: "" }],
});

function splitList(value: string): string[] {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

function asDraft(project: ApiProject): ProjectDraft {
  return {
    slug: project.slug,
    title: project.title,
    tagline: project.tagline,
    description: project.description ?? "",
    whatYouWillLearn: project.whatYouWillLearn ?? [],
    track: project.track,
    difficulty: normalizeDifficulty(project.difficulty),
    estimatedHours: project.estimatedHours,
    techStack: project.techStack ?? [],
    phases: (project.phases ?? []).map((phase, index) => ({
      id: phase.id,
      orderIndex: index + 1,
      title: phase.title,
      content: phase.content ?? "",
    })),
  };
}

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [draft, setDraft] = useState<ProjectDraft>(emptyProject);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [previewPhase, setPreviewPhase] = useState<number | null>(null);

  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const result = await api.getProjects();
      setProjects(result.projects);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load projects");
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    // Load protected curriculum after the session role has been restored.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!authLoading && user?.role === "admin") void loadProjects();
  }, [authLoading, user, loadProjects]);

  const heading = useMemo(() => editingSlug ? "Edit project" : "Create project", [editingSlug]);

  const startNew = () => {
    setEditingSlug(null);
    setDraft(emptyProject());
    setPreviewPhase(null);
    setError(null);
    setMessage(null);
  };

  const editProject = async (slug: string) => {
    setError(null);
    setMessage(null);
    try {
      const result = await api.getProject(slug);
      setDraft(asDraft(result.project));
      setEditingSlug(slug);
      setPreviewPhase(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load project details");
    }
  };

  const updatePhase = (index: number, changes: Partial<ProjectDraft["phases"][number]>) => {
    setDraft((current) => ({
      ...current,
      phases: current.phases.map((phase, phaseIndex) =>
        phaseIndex === index ? { ...phase, ...changes } : phase
      ),
    }));
  };

  const movePhase = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= draft.phases.length) return;
    setDraft((current) => {
      const nextPhases = [...current.phases];
      const temp = nextPhases[index];
      nextPhases[index] = nextPhases[newIndex];
      nextPhases[newIndex] = temp;
      return {
        ...current,
        phases: nextPhases.map((item, idx) => ({ ...item, orderIndex: idx + 1 })),
      };
    });
    setPreviewPhase((currentPreview) => {
      if (currentPreview === index) return newIndex;
      if (currentPreview === newIndex) return index;
      return currentPreview;
    });
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload: ProjectDraft = {
      ...draft,
      slug: draft.slug.trim().toLowerCase(),
      title: draft.title.trim(),
      tagline: draft.tagline.trim(),
      description: draft.description?.trim() || "",
      track: draft.track.trim(),
      estimatedHours: Number(draft.estimatedHours),
      techStack: Array.isArray(draft.techStack) ? draft.techStack : splitList(String(draft.techStack)),
      whatYouWillLearn: Array.isArray(draft.whatYouWillLearn)
        ? draft.whatYouWillLearn
        : splitList(String(draft.whatYouWillLearn)),
      phases: draft.phases.map((phase, index) => ({ ...phase, orderIndex: index + 1 })),
    };

    try {
      if (editingSlug) {
        await api.updateProject(editingSlug, payload);
        setMessage("Project updated.");
      } else {
        await api.createProject(payload);
        setMessage("Project created.");
      }
      setEditingSlug(payload.slug);
      await loadProjects();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingSlug) return;
    const confirmed = window.confirm(
      `Delete “${draft.title}” and permanently remove its enrollments, progress, personal notes, and curriculum reports? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    try {
      await api.deleteProject(editingSlug);
      startNew();
      setMessage("Project and related learner data deleted.");
      await loadProjects();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete project");
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050507]">
        <Loader2 className="h-6 w-6 animate-spin text-white" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-xl px-5 py-20 text-center min-h-[80vh] flex flex-col items-center justify-center bg-[#050507]">
          <h1 className="font-serif text-2xl font-bold text-white">Admin access required</h1>
          <p className="mt-2 text-sm text-neutral-400">Sign in with the account configured in `ADMIN_EMAIL` to manage curriculum.</p>
          <Link href="/profile" className="mt-5 inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-white"><ArrowLeft className="h-4 w-4" />Back to profile</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#050507] px-4 py-8 text-neutral-100 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">Curriculum</p>
                <h1 className="font-serif text-lg font-bold text-white">Projects</h1>
              </div>
              <button
                onClick={startNew}
                className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 shadow-sm cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />New
              </button>
            </div>
            {loadingProjects ? (
              <Loader2 className="mx-auto my-8 h-5 w-5 animate-spin text-white" />
            ) : (
              <div className="max-h-[70vh] space-y-1 overflow-y-auto">
                {projects.map((project) => (
                  <button
                    key={project.slug}
                    onClick={() => void editProject(project.slug)}
                    className={`w-full rounded-lg px-3 py-2 text-left cursor-pointer transition-colors ${
                      editingSlug === project.slug
                        ? "border border-white/20 bg-white/[0.07] text-white"
                        : "hover:bg-white/[0.04] text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    <span className="block text-xs font-medium">{project.title}</span>
                    <span className="mt-0.5 block truncate font-mono text-[10px] text-neutral-500">{project.slug}</span>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <section className="rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-4 sm:p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">Admin editor</p>
                <h2 className="font-serif text-xl font-bold text-white">{heading}</h2>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/admin/issues" className="text-xs text-neutral-400 hover:text-white">Curriculum issue reports</Link>
                {editingSlug && (
                  <Link
                    href={`/projects/${draft.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white"
                  >
                    <Eye className="h-3.5 w-3.5" />Preview saved project
                  </Link>
                )}
              </div>
            </div>

            {error && <p role="alert" className="mb-4 rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-200">{error}</p>}
            {message && <p role="status" className="mb-4 rounded-lg border border-emerald-900/50 bg-emerald-950/30 p-3 text-xs text-emerald-200">{message}</p>}

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-xs text-neutral-300">Slug<input required maxLength={64} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} className="admin-input" placeholder="distributed-cache" /></label>
                <label className="space-y-1 text-xs text-neutral-300">Title<input required maxLength={120} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="admin-input" /></label>
                <label className="space-y-1 text-xs text-neutral-300 sm:col-span-2">Tagline<input required maxLength={240} value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} className="admin-input" /></label>
                <label className="space-y-1 text-xs text-neutral-300">Track<input required maxLength={80} value={draft.track} onChange={(e) => setDraft({ ...draft, track: e.target.value })} className="admin-input" placeholder="Backend Engineering" /></label>
                <label className="space-y-1 text-xs text-neutral-300">Difficulty<select value={draft.difficulty} onChange={(e) => setDraft({ ...draft, difficulty: e.target.value })} className="admin-input"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
                <label className="space-y-1 text-xs text-neutral-300">Estimated hours<input required type="number" min={1} max={5000} value={draft.estimatedHours} onChange={(e) => setDraft({ ...draft, estimatedHours: Number(e.target.value) })} className="admin-input" /></label>
                <label className="space-y-1 text-xs text-neutral-300">Technologies <span className="text-neutral-500">(comma or newline separated)</span><textarea required rows={2} value={Array.isArray(draft.techStack) ? draft.techStack.join(", ") : draft.techStack} onChange={(e) => setDraft({ ...draft, techStack: splitList(e.target.value) })} className="admin-input" /></label>
                <label className="space-y-1 text-xs text-neutral-300">What learners will learn <span className="text-neutral-500">(one per line)</span><textarea rows={2} value={Array.isArray(draft.whatYouWillLearn) ? draft.whatYouWillLearn.join("\n") : draft.whatYouWillLearn} onChange={(e) => setDraft({ ...draft, whatYouWillLearn: splitList(e.target.value) })} className="admin-input" /></label>
                <label className="space-y-1 text-xs text-neutral-300 sm:col-span-2">Description<textarea rows={4} maxLength={20000} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="admin-input" /></label>
              </div>

              <div className="space-y-3 border-t border-white/[0.08] pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-white">Phases</h3>
                    <p className="text-[11px] text-neutral-400">Order follows the list; content supports Markdown.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDraft((current) => ({ ...current, phases: [...current.phases, { id: `phase-${current.phases.length + 1}`, orderIndex: current.phases.length + 1, title: "", content: "" }] }))}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-neutral-300 hover:bg-white/[0.04] hover:text-white cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />Add phase
                  </button>
                </div>
                {draft.phases.map((phase, index) => (
                  <div key={`${phase.id}-${index}`} className="rounded-lg border border-white/[0.08] bg-[#07070A] p-3 sm:p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">Phase {index + 1}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => movePhase(index, -1)}
                          className="rounded p-1 text-neutral-400 hover:bg-white/[0.06] hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
                          title="Move phase up"
                          aria-label={`Move phase ${index + 1} up`}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === draft.phases.length - 1}
                          onClick={() => movePhase(index, 1)}
                          className="rounded p-1 text-neutral-400 hover:bg-white/[0.06] hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
                          title="Move phase down"
                          aria-label={`Move phase ${index + 1} down`}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewPhase(previewPhase === index ? null : index)}
                          className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white"
                        >
                          <Eye className="h-3 w-3" />{previewPhase === index ? "Edit content" : "Preview"}
                        </button>
                        <button
                          type="button"
                          disabled={draft.phases.length === 1}
                          onClick={() => {
                            setDraft((current) => ({
                              ...current,
                              phases: current.phases.filter((_, phaseIndex) => phaseIndex !== index).map((item, phaseIndex) => ({ ...item, orderIndex: phaseIndex + 1 }))
                            }));
                            setPreviewPhase(null);
                          }}
                          className="rounded p-1 text-rose-400 hover:bg-rose-950/40 disabled:opacity-30 cursor-pointer"
                          aria-label={`Remove phase ${index + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                      <label className="space-y-1 text-[11px] text-neutral-300">Phase ID<input required maxLength={64} pattern="[A-Za-z0-9]+(-[A-Za-z0-9]+)*" value={phase.id} onChange={(e) => updatePhase(index, { id: e.target.value })} className="admin-input" /></label>
                      <label className="space-y-1 text-[11px] text-neutral-300">Title<input required maxLength={160} value={phase.title} onChange={(e) => updatePhase(index, { title: e.target.value })} className="admin-input" /></label>
                    </div>
                    {previewPhase === index ? (
                      <article className="prose prose-invert mt-4 max-h-96 overflow-y-auto rounded-md border border-white/[0.08] bg-[#0A0A0E] p-4 text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{phase.content || "Nothing to preview yet."}</ReactMarkdown>
                      </article>
                    ) : (
                      <label className="mt-3 block space-y-1 text-[11px] text-neutral-300">Markdown content<textarea required rows={12} maxLength={100000} value={phase.content} onChange={(e) => updatePhase(index, { content: e.target.value })} className="admin-input font-mono leading-relaxed" /></label>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
                <div>
                  {editingSlug && (
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => void handleDelete()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-900/50 px-3 py-2 text-xs text-red-200 hover:bg-red-950/30 disabled:opacity-50 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />{deleting ? "Deleting…" : "Delete project"}
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={saving || deleting}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-black hover:bg-neutral-200 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? "Saving…" : editingSlug ? "Save changes" : "Create project"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
      <style jsx global>{`
        .admin-input {
          display: block;
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          background: #050507;
          padding: 0.55rem 0.7rem;
          color: #FFFFFF;
          font-size: 0.75rem;
          outline: none;
        }
        .admin-input:focus {
          border-color: rgba(255, 255, 255, 0.3);
        }
        .admin-input::placeholder {
          color: #71717A;
        }
      `}</style>
    </>
  );
}
