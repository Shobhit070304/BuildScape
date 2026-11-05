"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { api, type AdminCurriculumIssue, type CurriculumIssueStatus } from "@/lib/api";

const statusLabels: Record<CurriculumIssueStatus, string> = {
  open: "Open",
  in_review: "In review",
  resolved: "Resolved",
};

export default function AdminIssuesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [filter, setFilter] = useState<CurriculumIssueStatus | "all">("open");
  const [issues, setIssues] = useState<AdminCurriculumIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadIssues = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.getCurriculumIssues(filter === "all" ? undefined : filter);
      setIssues(result.issues);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load issue reports");
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => {
    // Load protected reports after the session role has been restored.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!authLoading && user?.role === "admin") void loadIssues();
  }, [authLoading, user, loadIssues]);

  const updateStatus = async (issue: AdminCurriculumIssue, status: CurriculumIssueStatus) => {
    setUpdatingId(issue._id);
    setError("");
    try {
      await api.updateCurriculumIssue(issue._id, status);
      await loadIssues();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update issue");
    } finally { setUpdatingId(null); }
  };

  if (authLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div>;
  if (!user || user.role !== "admin") return <><Navbar /><main className="mx-auto max-w-xl px-5 py-20 text-center"><h1 className="font-serif text-2xl font-bold">Admin access required</h1><p className="mt-2 text-sm text-text-muted">Sign in with the account configured to manage curriculum.</p><Link href="/admin" className="mt-5 inline-flex items-center gap-2 text-sm text-accent"><ArrowLeft className="h-4 w-4" />Back to admin</Link></main></>;

  return <><Navbar /><main className="min-h-screen bg-[#0a0a0a] px-4 py-8 text-[#e4ddd3] sm:px-6">
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><Link href="/admin" className="mb-2 inline-flex items-center gap-1 text-xs text-text-faint hover:text-accent"><ArrowLeft className="h-3.5 w-3.5" />Curriculum editor</Link><h1 className="font-serif text-2xl font-bold">Issue reports</h1><p className="mt-1 text-sm text-text-muted">Review learner feedback tied to a specific project phase.</p></div>
        <div className="flex items-center gap-2"><select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="rounded-lg border border-[#342f27] bg-[#11100e] px-3 py-2 text-xs"><option value="open">Open</option><option value="in_review">In review</option><option value="resolved">Resolved</option><option value="all">All statuses</option></select><button onClick={() => void loadIssues()} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg border border-[#342f27] px-3 py-2 text-xs hover:bg-[#1a1814] disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />Refresh</button></div>
      </div>
      {error && <p role="alert" className="mb-4 rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-200">{error}</p>}
      {loading && issues.length === 0 ? <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div> : issues.length === 0 ? <div className="rounded-xl border border-[#28241e] bg-[#11100e] p-8 text-center text-sm text-text-muted">No reports in this view.</div> : <div className="space-y-3">
        {issues.map((issue) => <article key={issue._id} className="rounded-xl border border-[#28241e] bg-[#11100e] p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><Link href={`/projects/${encodeURIComponent(issue.projectId.slug)}`} className="font-medium text-accent hover:underline">{issue.projectId.title}</Link><p className="mt-1 text-xs text-text-muted">Phase: {issue.phaseTitle} <span className="mx-1.5 text-[#514a40]">·</span> {issue.category.replace(/_/g, " ")}</p></div>
            <select aria-label={`Update status for issue from ${issue.userId.name}`} value={issue.status} disabled={updatingId === issue._id} onChange={(event) => void updateStatus(issue, event.target.value as CurriculumIssueStatus)} className="rounded-lg border border-[#342f27] bg-[#0d0c0a] px-2.5 py-1.5 text-xs disabled:opacity-50">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          </div>
          <p className="my-3 whitespace-pre-wrap text-sm leading-relaxed text-[#d1c8bc]">{issue.message}</p>
          <div className="border-t border-[#29251f] pt-2 text-[11px] text-text-faint">Reported by {issue.userId.username ? `@${issue.userId.username}` : issue.userId.name} · {new Date(issue.createdAt).toLocaleString()}</div>
        </article>)}
      </div>}
    </div>
  </main></>;
}
