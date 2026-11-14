"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, Loader2 } from "lucide-react";
import { api, type GlobalReviewItem } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ReviewModal } from "@/components/ReviewModal";

export function ReviewsSection() {
  const router = useRouter();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<GlobalReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .getGlobalReviews()
      .then((res) => {
        if (!cancelled) {
          setReviews(res.reviews || []);
        }
      })
      .catch(() => {
        // Fallback gracefully
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleReviewUpdated = (newReview: GlobalReviewItem) => {
    setReviews((prev) => {
      const idx = prev.findIndex((r) => r.id === newReview.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = newReview;
        return next;
      }
      return [newReview, ...prev];
    });
  };

  const handleReviewDeleted = () => {
    if (!user) return;
    setReviews((prev) => prev.filter((r) => r.user.username !== user.username));
  };

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Soft atmospheric gradient glow behind reviews */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-full max-w-5xl rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.06)_0%,rgba(168,85,247,0.03)_40%,transparent_70%)] blur-[100px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Minimal Sleek Header */}
        <div className="flex items-center justify-between pb-8 mb-8 border-b border-white/[0.06]">
          <div>
            <span className="font-mono text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
              REVIEWS
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              What builders say
            </h2>
          </div>

          <div>
            {user ? (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="font-mono text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                + Leave a review
              </button>
            ) : (
              <Link
                href="/profile"
                className="font-mono text-xs text-neutral-300 hover:text-white transition-colors"
              >
                Sign in to review →
              </Link>
            )}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-xs font-mono text-neutral-500">No reviews yet.</p>
            <button
              type="button"
              onClick={() => (user ? setIsModalOpen(true) : router.push("/profile"))}
              className="mt-3 text-xs font-mono text-indigo-400 hover:underline cursor-pointer"
            >
              Be the first to share your experience
            </button>
          </div>
        ) : (
          /* Sleek, Borderless Column Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {reviews.map((rev) => {
              return (
                <div
                  key={rev.id}
                  className="group flex flex-col justify-between rounded-xl p-3 sm:p-4 transition-colors hover:bg-white/[0.02]"
                >
                  <div>
                    {/* User Info & Simple Clean Stars */}
                    <div className="flex items-center justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Link
                          href={`/profile/${rev.user.username}`}
                          className="shrink-0"
                        >
                          {rev.user.avatar ? (
                            <Image
                              src={rev.user.avatar}
                              alt={rev.user.name}
                              width={32}
                              height={32}
                              className="rounded-full object-cover ring-1 ring-white/10"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.08] font-mono text-xs font-bold text-white ring-1 ring-white/10">
                              {rev.user.name.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                        </Link>
                        <Link
                          href={`/profile/${rev.user.username}`}
                          className="font-sans text-xs sm:text-sm font-semibold text-white hover:text-neutral-200 truncate"
                        >
                          {rev.user.name}
                        </Link>
                      </div>

                      {/* Clean flat stars - no shine, no glow */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-neutral-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Simple Clean Comment */}
                    <p className="text-xs sm:text-[13px] text-neutral-300 leading-relaxed font-sans">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReviewSubmitted={handleReviewUpdated}
        onReviewDeleted={handleReviewDeleted}
      />
    </section>
  );
}
