"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export function ProjectBookmarkButton({ slug }: { slug: string }) {
  const { user, isLoading: authLoading } = useAuth();
  const [bookmarkState, setBookmarkState] = useState<{ userId: string; slug: string; bookmarked: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (authLoading) return () => { active = false; };
    if (!user) return () => { active = false; };

    api.getBookmarkedProjects()
      .then(({ projects }) => {
        if (active) setBookmarkState({ userId: user.id, slug, bookmarked: projects.some((project) => project.slug === slug) });
      })
      .catch(() => {
        if (active) setMessage("Could not load bookmark status.");
      });
    return () => { active = false; };
  }, [authLoading, slug, user]);

  const bookmarked = user !== null && bookmarkState !== null
    ? bookmarkState.userId === user.id && bookmarkState.slug === slug && bookmarkState.bookmarked
    : false;

  const toggleBookmark = async () => {
    if (!user || loading) return;
    setLoading(true);
    setMessage(null);
    try {
      if (bookmarked) {
        await api.removeProjectBookmark(slug);
        setBookmarkState({ userId: user.id, slug, bookmarked: false });
        setMessage("Removed from bookmarks.");
      } else {
        await api.addProjectBookmark(slug);
        setBookmarkState({ userId: user.id, slug, bookmarked: true });
        setMessage("Saved to bookmarks.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update bookmark.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      {user ? (
        <button
          type="button"
          onClick={() => void toggleBookmark()}
          disabled={authLoading || loading}
          aria-pressed={bookmarked}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text-muted transition hover:border-border-hover hover:text-text disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : bookmarked ? <BookmarkCheck className="h-3.5 w-3.5 text-accent" /> : <Bookmark className="h-3.5 w-3.5" />}
          {bookmarked ? "Saved" : "Save project"}
        </button>
      ) : (
        <Link href="/profile" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text-muted transition hover:border-border-hover hover:text-text">
          <Bookmark className="h-3.5 w-3.5" /> Sign in to save
        </Link>
      )}
      {message && <span role="status" className="max-w-48 text-right text-[10px] text-text-faint">{message}</span>}
    </div>
  );
}
