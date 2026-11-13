"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  CheckCircle2,
  Share2,
  Trash2,
  Check,
  Eye,
  CornerDownRight,
  Reply,
  Loader2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MarkdownContent } from "@/components/MarkdownContent";
import { useAuth } from "@/context/AuthContext";
import {
  api,
  type DiscussionDetail,
  type DiscussionCommentItem,
  type DiscussionCategory,
} from "@/lib/api";

const CATEGORY_STYLES: Record<DiscussionCategory, { badge: string; label: string }> = {
  general: { badge: "border-neutral-700 bg-neutral-900/60 text-neutral-300", label: "General" },
  question: { badge: "border-sky-500/30 bg-sky-950/40 text-sky-300", label: "Question" },
  showcase: { badge: "border-purple-500/30 bg-purple-950/40 text-purple-300", label: "Showcase" },
  architecture: { badge: "border-amber-500/30 bg-amber-950/40 text-amber-300", label: "Architecture" },
  tip: { badge: "border-emerald-500/30 bg-emerald-950/40 text-emerald-300", label: "Tip" },
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DiscussionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const discussionId = resolvedParams.id;
  const router = useRouter();
  const { user } = useAuth();

  const [discussion, setDiscussion] = useState<DiscussionDetail | null>(null);
  const [comments, setComments] = useState<DiscussionCommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New comment
  const [replyText, setReplyText] = useState("");
  const [replyPreview, setReplyPreview] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [activeReplyParentId, setActiveReplyParentId] = useState<string | null>(null);
  const [nestedReplyText, setNestedReplyText] = useState("");
  const [submittingNested, setSubmittingNested] = useState(false);

  // Share feedback
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    Promise.all([
      api.getDiscussion(discussionId),
      api.getDiscussionComments(discussionId),
    ])
      .then(([discRes, commentsRes]) => {
        if (!cancelled) {
          setDiscussion(discRes.discussion);
          setComments(commentsRes.comments || []);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load discussion");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [discussionId]);

  const handleToggleUpvote = async () => {
    if (!user) {
      alert("Please sign in to upvote.");
      return;
    }
    if (!discussion) return;

    const nextState = !discussion.hasUpvoted;
    setDiscussion((prev) =>
      prev
        ? {
            ...prev,
            hasUpvoted: nextState,
            upvoteCount: nextState ? prev.upvoteCount + 1 : Math.max(0, prev.upvoteCount - 1),
          }
        : null
    );

    try {
      const res = await api.toggleUpvoteDiscussion(discussion.id);
      setDiscussion((prev) =>
        prev ? { ...prev, hasUpvoted: res.hasUpvoted, upvoteCount: res.upvoteCount } : null
      );
    } catch (err) {
      console.error("Failed to upvote discussion:", err);
    }
  };

  const handleToggleCommentUpvote = async (commentId: string) => {
    if (!user) {
      alert("Please sign in to upvote comments.");
      return;
    }

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const nextUpvoted = !c.hasUpvoted;
          return {
            ...c,
            hasUpvoted: nextUpvoted,
            upvoteCount: nextUpvoted ? c.upvoteCount + 1 : Math.max(0, c.upvoteCount - 1),
          };
        }
        return c;
      })
    );

    try {
      const res = await api.toggleUpvoteComment(discussionId, commentId);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, hasUpvoted: res.hasUpvoted, upvoteCount: res.upvoteCount } : c))
      );
    } catch (err) {
      console.error("Failed to toggle comment upvote:", err);
    }
  };

  const handleAcceptSolution = async (commentId: string) => {
    if (!user || !discussion) return;

    try {
      const res = await api.acceptCommentSolution(discussionId, commentId);
      setDiscussion((prev) =>
        prev ? { ...prev, isResolved: res.isResolved, acceptedCommentId: res.acceptedCommentId } : null
      );
      setComments((prev) =>
        prev.map((c) => ({
          ...c,
          isAcceptedSolution: c.id === commentId ? res.isResolved : false,
        }))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to set accepted solution");
    }
  };

  const handleDeleteDiscussion = async () => {
    if (!confirm("Are you sure you want to delete this discussion thread?")) return;
    try {
      await api.deleteDiscussion(discussionId);
      router.push("/discussions");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete discussion");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await api.deleteComment(discussionId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setDiscussion((prev) => (prev ? { ...prev, replyCount: Math.max(0, prev.replyCount - 1) } : null));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete comment");
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in to post a reply.");
      return;
    }
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      const res = await api.createComment(discussionId, { content: replyText.trim() });
      setComments((prev) => [
        ...prev,
        {
          ...res.comment,
          hasUpvoted: false,
          upvoteCount: 0,
          isAcceptedSolution: false,
        },
      ]);
      setDiscussion((prev) => (prev ? { ...prev, replyCount: prev.replyCount + 1 } : null));
      setReplyText("");
      setReplyPreview(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handlePostNestedReply = async (parentId: string) => {
    if (!user) {
      alert("Please sign in to reply.");
      return;
    }
    if (!nestedReplyText.trim()) return;

    setSubmittingNested(true);
    try {
      const res = await api.createComment(discussionId, {
        content: nestedReplyText.trim(),
        parentId,
      });
      setComments((prev) => [
        ...prev,
        {
          ...res.comment,
          hasUpvoted: false,
          upvoteCount: 0,
          isAcceptedSolution: false,
        },
      ]);
      setDiscussion((prev) => (prev ? { ...prev, replyCount: prev.replyCount + 1 } : null));
      setActiveReplyParentId(null);
      setNestedReplyText("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to post reply");
    } finally {
      setSubmittingNested(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      void navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-neutral-500">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400 mb-2" />
          <p className="text-xs">Loading discussion thread...</p>
        </div>
      </div>
    );
  }

  if (error || !discussion) {
    return (
      <div className="min-h-screen bg-[#050507] text-white">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <p className="text-sm text-red-400 mb-4">{error || "Discussion not found"}</p>
          <Link
            href="/discussions"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Discussions</span>
          </Link>
        </div>
      </div>
    );
  }

  const catStyle = CATEGORY_STYLES[discussion.category] || CATEGORY_STYLES.general;
  const isAuthor = user?.id === discussion.author.id;
  const isAdmin = user?.role === "admin";
  const acceptedComment = comments.find((c) => c.isAcceptedSolution);

  // Group top-level comments and replies
  const rootComments = comments.filter((c) => !c.parentId);
  const repliesByParentId: Record<string, DiscussionCommentItem[]> = {};
  for (const c of comments) {
    if (c.parentId) {
      if (!repliesByParentId[c.parentId]) repliesByParentId[c.parentId] = [];
      repliesByParentId[c.parentId].push(c);
    }
  }

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/discussions"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Discussions</span>
        </Link>

        {/* Discussion Main Card */}
        <article className="rounded-2xl border border-white/10 bg-[#0A0A0E] p-6 sm:p-8 shadow-2xl">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${catStyle.badge}`}>
              {catStyle.label}
            </span>

            {discussion.projectSlug && (
              <Link
                href={`/projects/${discussion.projectSlug}`}
                className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs text-neutral-300 hover:text-white hover:border-white/20 transition-colors"
              >
                📦 {discussion.projectTitle || discussion.projectSlug}
              </Link>
            )}

            {discussion.isResolved && (
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Solved</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
            {discussion.title}
          </h1>

          {/* Author Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-5">
            <div className="flex items-center gap-2.5">
              <Link href={`/profile/${discussion.author.username || "builder"}`}>
                {discussion.author.avatar ? (
                  <Image
                    src={discussion.author.avatar}
                    alt={discussion.author.name}
                    width={34}
                    height={34}
                    className="rounded-full ring-1 ring-white/10 object-cover"
                  />
                ) : (
                  <div className="h-8.5 w-8.5 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                    {discussion.author.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </Link>
              <div>
                <Link
                  href={`/profile/${discussion.author.username || "builder"}`}
                  className="text-xs font-semibold text-white hover:text-indigo-300 transition-colors"
                >
                  {discussion.author.name}
                </Link>
                <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                  <span>@{discussion.author.username}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(discussion.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                <Eye className="h-3.5 w-3.5 text-neutral-500" />
                <span>{discussion.views} views</span>
              </span>
            </div>
          </div>

          {/* Body with syntax-highlighted Markdown */}
          <div className="mt-6 text-sm text-neutral-200 leading-relaxed">
            <MarkdownContent>{discussion.content}</MarkdownContent>
          </div>

          {/* Actions Footer */}
          <div className="mt-8 flex items-center justify-between pt-5 border-t border-white/[0.08]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleUpvote}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  discussion.hasUpvoted
                    ? "border-indigo-500/50 bg-indigo-950/40 text-indigo-300 shadow-sm shadow-indigo-500/20"
                    : "border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <span className="text-xs">▲</span>
                <span>Upvote</span>
                <span className="font-bold font-mono ml-0.5">{discussion.upvoteCount}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
                <span>{copied ? "Link Copied" : "Share"}</span>
              </button>
            </div>

            {(isAuthor || isAdmin) && (
              <button
                type="button"
                onClick={handleDeleteDiscussion}
                className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-950/20 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                title="Delete discussion"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
          </div>
        </article>

        {/* Accepted Solution Spotlight (if present) */}
        {acceptedComment && (
          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-transparent p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3 border-b border-emerald-500/20 pb-2.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Accepted Solution</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                <span>By</span>
                <Link
                  href={`/profile/${acceptedComment.author.username || "builder"}`}
                  className="font-medium text-emerald-300 hover:underline"
                >
                  {acceptedComment.author.name}
                </Link>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-neutral-200">
              <MarkdownContent>{acceptedComment.content}</MarkdownContent>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-400" />
              <span>Discussion ({comments.length})</span>
            </h2>
          </div>

          {/* Root Comments Stream */}
          <div className="space-y-4">
            {rootComments.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center text-xs text-neutral-400">
                No replies yet. Be the first to join the conversation!
              </div>
            ) : (
              rootComments.map((comment) => {
                const isCommentAuthor = user?.id === comment.author.id;
                const replies = repliesByParentId[comment.id] || [];

                return (
                  <div
                    key={comment.id}
                    className={`rounded-xl border p-4 sm:p-5 transition-all ${
                      comment.isAcceptedSolution
                        ? "border-emerald-500/40 bg-[#0A120E]"
                        : "border-white/[0.08] bg-[#0A0A0E]"
                    }`}
                  >
                    {/* Comment Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/profile/${comment.author.username || "builder"}`}>
                          {comment.author.avatar ? (
                            <Image
                              src={comment.author.avatar}
                              alt={comment.author.name}
                              width={24}
                              height={24}
                              className="rounded-full ring-1 ring-white/10 object-cover"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                              {comment.author.name.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                        </Link>
                        <div>
                          <Link
                            href={`/profile/${comment.author.username || "builder"}`}
                            className="text-xs font-semibold text-neutral-200 hover:text-white"
                          >
                            {comment.author.name}
                          </Link>
                          <span className="text-[11px] text-neutral-500 ml-1.5">
                            @{comment.author.username} • {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                      </div>

                      {comment.isAcceptedSolution && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Accepted Solution</span>
                        </span>
                      )}
                    </div>

                    {/* Comment Content */}
                    <div className="text-xs sm:text-sm text-neutral-300">
                      <MarkdownContent>{comment.content}</MarkdownContent>
                    </div>

                    {/* Actions Bar */}
                    <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleToggleCommentUpvote(comment.id)}
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                            comment.hasUpvoted
                              ? "border-indigo-500/40 bg-indigo-950/30 text-indigo-300"
                              : "border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white"
                          }`}
                        >
                          <span>▲</span>
                          <span className="font-mono font-bold">{comment.upvoteCount}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setActiveReplyParentId((cur) => (cur === comment.id ? null : comment.id))
                          }
                          className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white px-2 py-1 transition-colors cursor-pointer"
                        >
                          <Reply className="h-3 w-3" />
                          <span>Reply</span>
                        </button>

                        {/* Accept as solution toggle (only for discussion author or admin) */}
                        {(isAuthor || isAdmin) && (
                          <button
                            type="button"
                            onClick={() => void handleAcceptSolution(comment.id)}
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium transition-colors cursor-pointer ${
                              comment.isAcceptedSolution
                                ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                                : "border-white/10 bg-white/[0.02] text-neutral-400 hover:border-emerald-500/30 hover:text-emerald-300"
                            }`}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{comment.isAcceptedSolution ? "Unmark Solution" : "Mark as Solution"}</span>
                          </button>
                        )}
                      </div>

                      {(isCommentAuthor || isAdmin) && (
                        <button
                          type="button"
                          onClick={() => void handleDeleteComment(comment.id)}
                          className="text-neutral-500 hover:text-red-400 transition-colors cursor-pointer p-1"
                          title="Delete comment"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    {/* Inline Reply Composer */}
                    {activeReplyParentId === comment.id && (
                      <div className="mt-3 pl-4 border-l-2 border-indigo-500/30">
                        <textarea
                          rows={2}
                          value={nestedReplyText}
                          onChange={(e) => setNestedReplyText(e.target.value)}
                          placeholder={`Reply to @${comment.author.username}...`}
                          className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-xs text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none font-mono"
                        />
                        <div className="mt-2 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveReplyParentId(null)}
                            className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={submittingNested || !nestedReplyText.trim()}
                            onClick={() => void handlePostNestedReply(comment.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {submittingNested && <Loader2 className="h-3 w-3 animate-spin" />}
                            <span>Reply</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Threaded Nested Replies */}
                    {replies.length > 0 && (
                      <div className="mt-4 space-y-3 pl-4 sm:pl-6 border-l border-white/10">
                        {replies.map((reply) => {
                          const isReplyAuthor = user?.id === reply.author.id;
                          return (
                            <div key={reply.id} className="rounded-lg bg-white/[0.02] p-3 border border-white/[0.05]">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-1.5">
                                  <CornerDownRight className="h-3 w-3 text-neutral-600" />
                                  <Link
                                    href={`/profile/${reply.author.username || "builder"}`}
                                    className="text-xs font-semibold text-neutral-200 hover:text-white"
                                  >
                                    {reply.author.name}
                                  </Link>
                                  <span className="text-[10px] text-neutral-500">
                                    @{reply.author.username} • {formatTimeAgo(reply.createdAt)}
                                  </span>
                                </div>

                                {(isReplyAuthor || isAdmin) && (
                                  <button
                                    type="button"
                                    onClick={() => void handleDeleteComment(reply.id)}
                                    className="text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                                    title="Delete reply"
                                  >
                                    <Trash2 className="h-2.5 w-2.5" />
                                  </button>
                                )}
                              </div>

                              <div className="text-xs text-neutral-300">
                                <MarkdownContent>{reply.content}</MarkdownContent>
                              </div>

                              <div className="mt-2 flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => void handleToggleCommentUpvote(reply.id)}
                                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] transition-colors cursor-pointer ${
                                    reply.hasUpvoted
                                      ? "text-indigo-400 font-bold"
                                      : "text-neutral-500 hover:text-neutral-300"
                                  }`}
                                >
                                  <span>▲</span>
                                  <span>{reply.upvoteCount}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Root Reply Composer */}
          <form onSubmit={handlePostReply} className="mt-8 rounded-xl border border-white/10 bg-[#0A0A0E] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-200">
                Post a Reply
              </label>
              <div className="flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] p-0.5">
                <button
                  type="button"
                  onClick={() => setReplyPreview(false)}
                  className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                    !replyPreview ? "bg-white text-black font-semibold" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setReplyPreview(true)}
                  className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                    replyPreview ? "bg-white text-black font-semibold" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>

            {!replyPreview ? (
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={
                  user
                    ? "Share your solution, architectural perspective, or question..."
                    : "Please sign in to write a reply."
                }
                disabled={!user}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs font-mono text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 resize-y"
              />
            ) : (
              <div className="min-h-[100px] max-h-[220px] overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs">
                {replyText.trim() ? (
                  <MarkdownContent>{replyText}</MarkdownContent>
                ) : (
                  <span className="text-neutral-500 italic">Nothing to preview.</span>
                )}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 font-mono">
                Markdown & code blocks supported
              </span>
              <button
                type="submit"
                disabled={submittingReply || !replyText.trim() || !user}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors disabled:opacity-40 cursor-pointer shadow-sm"
              >
                {submittingReply && <Loader2 className="h-3 w-3 animate-spin" />}
                <span>Post Reply</span>
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
