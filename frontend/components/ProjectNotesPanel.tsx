"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Loader2, Save } from "lucide-react";
import { api } from "@/lib/api";

const MAX_NOTES_LENGTH = 10_000;

export function ProjectNotesPanel({ slug, projectTitle, open, onSaved }: { slug: string; projectTitle: string; open: boolean; onSaved: () => void }) {
  const [notes, setNotes] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [retry, setRetry] = useState(0);
  const latestNotes = useRef("");

  useEffect(() => {
    if (!open || loaded) return;
    let active = true;
    api.getProjectNotes(slug)
      .then(({ notes: savedNotes }) => {
        if (active) {
          latestNotes.current = savedNotes;
          setNotes(savedNotes);
          setLoaded(true);
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load project notes.");
      });
    return () => { active = false; };
  }, [loaded, open, retry, slug]);

  const saveNotes = async () => {
    const notesToSave = notes;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api.saveProjectNotes(slug, notesToSave);
      const savedCurrentDraft = latestNotes.current === notesToSave;
      setSaved(savedCurrentDraft);
      if (savedCurrentDraft) onSaved();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save project notes.");
    } finally {
      setSaving(false);
    }
  };

  const downloadNotes = () => {
    const markdown = `# ${projectTitle} — Private Notes\n\n${notes.trim()}\n`;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug.replace(/[^a-z0-9-]/gi, "-")}-notes.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section className="mx-auto w-full max-w-4xl rounded-xl border border-border bg-surface-card p-5 sm:p-7">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg font-semibold text-text">Project notes</h2>
          <p className="mt-1 text-xs text-text-muted">Private notes saved to your account for this project.</p>
        </div>
        <span className="shrink-0 font-mono text-[10px] text-text-faint">{notes.length.toLocaleString()} / {MAX_NOTES_LENGTH.toLocaleString()}</span>
      </div>

      {open && !loaded && !error ? (
        <div className="flex h-48 items-center justify-center text-text-muted"><Loader2 className="h-4 w-4 animate-spin" /></div>
      ) : !loaded && error ? (
        <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-4 text-center">
          <p role="alert" className="text-xs text-rose-300">{error}</p>
          <button type="button" onClick={() => { setError(null); setRetry((current) => current + 1); }} className="mt-3 rounded-md border border-border px-3 py-1.5 text-xs text-text hover:bg-surface-raised">Try again</button>
        </div>
      ) : (
        <>
          <textarea
            value={notes}
            onChange={(event) => {
              const nextNotes = event.target.value.slice(0, MAX_NOTES_LENGTH);
              latestNotes.current = nextNotes;
              setNotes(nextNotes);
              setSaved(false);
            }}
            maxLength={MAX_NOTES_LENGTH}
            placeholder="Write down decisions, commands, errors, or ideas for this project…"
            aria-label="Private project notes"
            className="min-h-64 w-full resize-y rounded-lg border border-border bg-surface px-3 py-3 text-sm leading-relaxed text-text outline-none placeholder:text-text-faint focus:border-amber-700/60 focus:ring-1 focus:ring-amber-700/20"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p role={error ? "alert" : "status"} className={`text-xs ${error ? "text-rose-300" : "text-text-muted"}`}>
              {error ?? (saved ? "Notes saved." : "Your notes are visible only to you.")}
            </p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={downloadNotes} disabled={!loaded || !notes.trim()} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-muted transition hover:bg-surface-raised hover:text-text disabled:cursor-not-allowed disabled:opacity-50" title="Download only your private notes as Markdown">
                <Download className="h-3.5 w-3.5" /> Download .md
              </button>
              <button
                type="button"
                onClick={() => void saveNotes()}
                disabled={saving || !loaded}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-700 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {saving ? "Saving…" : "Save notes"}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
