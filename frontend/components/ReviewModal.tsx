"use client";

import { useState, useEffect } from "react";
import { Star, X, Loader2, Trash2 } from "lucide-react";
import { api, type GlobalReviewItem } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: (review: GlobalReviewItem) => void;
  onReviewDeleted?: () => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  onReviewSubmitted,
  onReviewDeleted,
}: ReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingReview, setHasExistingReview] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingInitial(true);
    setError(null);

    api
      .getMyReview()
      .then((res) => {
        if (!cancelled && res.review) {
          setRating(res.review.rating);
          setComment(res.review.comment);
          setHasExistingReview(true);
        } else if (!cancelled) {
          setHasExistingReview(false);
        }
      })
      .catch(() => {
        // Not critical if fetch fails
      })
      .finally(() => {
        if (!cancelled) setLoadingInitial(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.trim().length < 10) {
      setError("Please write at least 10 characters sharing your review.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const res = await api.submitReview({
        rating,
        comment: comment.trim(),
      });
      if (onReviewSubmitted) {
        onReviewSubmitted(res.review);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your review?")) return;
    setDeleting(true);
    setError(null);

    try {
      await api.deleteReview();
      setHasExistingReview(false);
      setComment("");
      if (onReviewDeleted) {
        onReviewDeleted();
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete review");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-6 sm:p-7 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 rounded-lg p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <h2 className="font-sans text-base font-bold text-white tracking-tight">
            {hasExistingReview ? "Edit Your Review" : "Leave a Review"}
          </h2>
          <p className="font-mono text-xs text-neutral-400 mt-0.5">
            Share your feedback with the developer community
          </p>
        </div>

        {loadingInitial ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs font-mono text-neutral-400">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
            <span>Loading...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Clean Flat Star Rating */}
            <div>
              <label className="block text-[11px] font-mono text-neutral-400 mb-2">
                RATING
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-0.5 text-xl transition-transform hover:scale-110 cursor-pointer focus:outline-hidden"
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          isFilled
                            ? "fill-amber-400 text-amber-400"
                            : "text-neutral-700 hover:text-neutral-500"
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="font-mono text-xs font-semibold text-neutral-300 ml-2">
                  {hoverRating || rating} / 5
                </span>
              </div>
            </div>

            {/* Comment Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-mono text-neutral-400">
                  COMMENT
                </label>
                <span className="text-[10px] font-mono text-neutral-500">
                  {comment.length} / 1000
                </span>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you think of the project builds and experience?"
                rows={4}
                maxLength={1000}
                className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#07070A] p-3.5 text-xs text-white placeholder-neutral-500 focus:border-white/20 focus:outline-hidden leading-relaxed"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-950/20 px-3 py-2 text-xs text-red-300 font-mono">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              {hasExistingReview ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting || submitting}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                >
                  {deleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  <span>Delete</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-3 py-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || deleting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />}
                  <span>{hasExistingReview ? "Save Changes" : "Publish"}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
