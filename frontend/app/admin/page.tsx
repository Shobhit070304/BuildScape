"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Eye, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { ApiProject, ProjectPayload } from "@/lib/api";

type ProjectDraft = ProjectPayload;

const emptyProject = (): ProjectDraft => ({
  slug: "",
  title: "",
  tagline: "",
  description: "",
  whatYouWillLearn: [],
  track: "",
  difficulty: "Entry",
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
    difficulty: project.difficulty,
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
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div>;
  }

  if (!user || user.role !== "admin") {
    return (
      <><Navbar /><main className="mx-auto max-w-xl px-5 py-20 text-center">
        <h1 className="font-serif text-2xl font-bold">Admin access required</h1>
        <p className="mt-2 text-sm text-text-muted">Sign in with the account configured in `ADMIN_EMAIL` to manage curriculum.</p>
        <Link href="/profile" className="mt-5 inline-flex items-center gap-2 text-sm text-accent"><ArrowLeft className="h-4 w-4" />Back to profile</Link>
      </main></>
    );
  }

  return (
    <><Navbar /><main className="min-h-screen bg-[#0a0a0a] px-4 py-8 text-[#e4ddd3] sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-xl border border-[#28241e] bg-[#11100e] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div><p className="text-[10px] uppercase tracking-widest text-[#81776b]">Curriculum</p><h1 className="font-serif text-lg font-bold">Projects</h1></div>
            <button onClick={startNew} className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1.5 text-xs font-semibold text-black"><Plus className="h-3.5 w-3.5" />New</button>
          </div>
          {loadingProjects ? <Loader2 className="mx-auto my-8 h-5 w-5 animate-spin text-accent" /> : (
            <div className="max-h-[70vh] space-y-1 overflow-y-auto">
              {projects.map((project) => <button key={project.slug} onClick={() => void editProject(project.slug)} className={`w-full rounded-lg px-3 py-2 text-left ${editingSlug === project.slug ? "bg-amber-950/40 text-accent" : "hover:bg-[#1a1814]"}`}><span className="block text-xs font-medium">{project.title}</span><span className="mt-0.5 block truncate font-mono text-[10px] text-[#81776b]">{project.slug}</span></button>)}
            </div>
          )}
        </aside>

        <section className="rounded-xl border border-[#28241e] bg-[#11100e] p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#29251f] pb-4">
            <div><p className="text-[10px] uppercase tracking-widest text-[#81776b]">Admin editor</p><h2 className="font-serif text-xl font-bold">{heading}</h2></div>
            <div className="flex items-center gap-4">
              <Link href="/admin/issues" className="text-xs text-accent hover:underline">Curriculum issue reports</Link>
              {editingSlug && <Link href={`/projects/${draft.slug}`} target="_blank" className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"><Eye className="h-3.5 w-3.5" />Preview saved project</Link>}
            </div>
          </div>

          {error && <p role="alert" className="mb-4 rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-200">{error}</p>}
          {message && <p role="status" className="mb-4 rounded-lg border border-emerald-900/50 bg-emerald-950/30 p-3 text-xs text-emerald-200">{message}</p>}

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-xs">Slug<input required maxLength={64} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} className="admin-input" placeholder="distributed-cache" /></label>
              <label className="space-y-1 text-xs">Title<input required maxLength={120} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="admin-input" /></label>
              <label className="space-y-1 text-xs sm:col-span-2">Tagline<input required maxLength={240} value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} className="admin-input" /></label>
              <label className="space-y-1 text-xs">Track<input required maxLength={80} value={draft.track} onChange={(e) => setDraft({ ...draft, track: e.target.value })} className="admin-input" placeholder="Backend Engineering" /></label>
              <label className="space-y-1 text-xs">Difficulty<select value={draft.difficulty} onChange={(e) => setDraft({ ...draft, difficulty: e.target.value })} className="admin-input"><option>Entry</option><option>Basic</option><option>Intermediate</option><option>Advanced</option><option>Expert</option></select></label>
              <label className="space-y-1 text-xs">Estimated hours<input required type="number" min={1} max={5000} value={draft.estimatedHours} onChange={(e) => setDraft({ ...draft, estimatedHours: Number(e.target.value) })} className="admin-input" /></label>
              <label className="space-y-1 text-xs">Technologies <span className="text-[#81776b]">(comma or newline separated)</span><textarea required rows={2} value={Array.isArray(draft.techStack) ? draft.techStack.join(", ") : draft.techStack} onChange={(e) => setDraft({ ...draft, techStack: splitList(e.target.value) })} className="admin-input" /></label>
              <label className="space-y-1 text-xs">What learners will learn <span className="text-[#81776b]">(one per line)</span><textarea rows={2} value={Array.isArray(draft.whatYouWillLearn) ? draft.whatYouWillLearn.join("\n") : draft.whatYouWillLearn} onChange={(e) => setDraft({ ...draft, whatYouWillLearn: splitList(e.target.value) })} className="admin-input" /></label>
              <label className="space-y-1 text-xs sm:col-span-2">Description<textarea rows={4} maxLength={20000} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="admin-input" /></label>
            </div>

            <div className="space-y-3 border-t border-[#29251f] pt-5">
              <div className="flex items-center justify-between"><div><h3 className="font-serif text-lg font-semibold">Phases</h3><p className="text-[11px] text-[#81776b]">Order follows the list; content supports Markdown.</p></div><button type="button" onClick={() => setDraft((current) => ({ ...current, phases: [...current.phases, { id: `phase-${current.phases.length + 1}`, orderIndex: current.phases.length + 1, title: "", content: "" }] }))} className="inline-flex items-center gap-1 rounded-lg border border-[#373128] px-2.5 py-1.5 text-xs hover:bg-[#1a1814]"><Plus className="h-3.5 w-3.5" />Add phase</button></div>
              {draft.phases.map((phase, index) => <div key={`${phase.id}-${index}`} className="rounded-lg border border-[#2b2720] bg-[#0d0c0a] p-3 sm:p-4">
                <div className="mb-3 flex items-center justify-between"><span className="font-mono text-[11px] uppercase tracking-wider text-[#9b8d7c]">Phase {index + 1}</span><div className="flex items-center gap-2"><button type="button" onClick={() => setPreviewPhase(previewPhase === index ? null : index)} className="inline-flex items-center gap-1 text-[11px] text-accent"><Eye className="h-3 w-3" />{previewPhase === index ? "Edit content" : "Preview"}</button><button type="button" disabled={draft.phases.length === 1} onClick={() => { setDraft((current) => ({ ...current, phases: current.phases.filter((_, phaseIndex) => phaseIndex !== index).map((item, phaseIndex) => ({ ...item, orderIndex: phaseIndex + 1 })) })); setPreviewPhase(null); }} className="rounded p-1 text-red-300 hover:bg-red-950/40 disabled:opacity-30" aria-label={`Remove phase ${index + 1}`}><Trash2 className="h-3.5 w-3.5" /></button></div></div>
                <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]"><label className="space-y-1 text-[11px]">Phase ID<input required maxLength={64} pattern="[A-Za-z0-9]+(-[A-Za-z0-9]+)*" value={phase.id} onChange={(e) => updatePhase(index, { id: e.target.value })} className="admin-input" /></label><label className="space-y-1 text-[11px]">Title<input required maxLength={160} value={phase.title} onChange={(e) => updatePhase(index, { title: e.target.value })} className="admin-input" /></label></div>
                {previewPhase === index ? <article className="prose mt-4 max-h-96 overflow-y-auto rounded-md border border-[#29251f] p-4 text-sm"><ReactMarkdown remarkPlugins={[remarkGfm]}>{phase.content || "Nothing to preview yet."}</ReactMarkdown></article> : <label className="mt-3 block space-y-1 text-[11px]">Markdown content<textarea required rows={12} maxLength={100000} value={phase.content} onChange={(e) => updatePhase(index, { content: e.target.value })} className="admin-input font-mono leading-relaxed" /></label>}
              </div>)}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#29251f] pt-4">
              <div>{editingSlug && <button type="button" disabled={deleting} onClick={() => void handleDelete()} className="inline-flex items-center gap-1.5 rounded-lg border border-red-900/50 px-3 py-2 text-xs text-red-200 hover:bg-red-950/30 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" />{deleting ? "Deleting…" : "Delete project"}</button>}</div>
              <button type="submit" disabled={saving || deleting} className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-black hover:bg-amber-500 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? "Saving…" : editingSlug ? "Save changes" : "Create project"}</button>
            </div>
          </form>
        </section>
      </div>
    </main><style jsx global>{`.admin-input{display:block;width:100%;border:1px solid #342f27;border-radius:.5rem;background:#14120f;padding:.55rem .7rem;color:#e4ddd3;font-size:.75rem;outline:none}.admin-input:focus{border-color:#a16207}.admin-input::placeholder{color:#6b6256}`}</style></>
  );
}
