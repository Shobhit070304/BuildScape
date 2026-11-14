"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { getAllBlogPosts } from "@/lib/blog";

const CATEGORIES = ["All", "Engineering", "Product", "Founder Log"] as const;

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const posts = useMemo(() => getAllBlogPosts(), []);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "All") return posts;
    return posts.filter((p) => p.category === selectedCategory);
  }, [posts, selectedCategory]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full bg-[#050507] pb-24 pt-10 text-white relative overflow-hidden">
        {/* Rich Ambient Atmospheric Radial Glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[450px] w-full max-w-5xl -translate-x-1/2 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(99,102,241,0.14),rgba(147,51,234,0.06)_40%,transparent_75%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-[-5%] top-[25%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.05)_0%,transparent_70%)] blur-[110px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-[-5%] top-[55%] h-[450px] w-[450px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.05)_0%,transparent_70%)] blur-[120px]"
          aria-hidden="true"
        />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative">
          {/* Editorial Header */}
          <div className="mb-10">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-indigo-400">
                THE LOG
              </span>
              <span className="font-mono text-xs text-neutral-500">
                {posts.length} entries · ed. 2026
              </span>
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Engineering Notes &amp; Architecture Write-ups
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Architectural decisions, release retrospectives, and practical insights on building production software without tutorial fluff.
            </p>
          </div>

          {/* Sleek Category Filter Pills (Boxless inline tags) */}
          <div className="mb-10 flex items-center gap-2 flex-wrap border-b border-white/[0.06] pb-4">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white text-black shadow-xs font-bold"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Clean, Boxless Editorial Article Stream (No outer box / border / card bg) */}
          <div className="divide-y divide-white/[0.06]">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block py-8 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-neutral-500">
                      {post.number}
                    </span>
                    <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{post.publishedAt}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readingTime}</span>
                    </span>
                  </div>
                </div>

                <h2 className="font-sans text-lg sm:text-xl font-bold text-white group-hover:text-indigo-200 transition-colors mb-2 leading-snug">
                  {post.title}
                </h2>

                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-4 max-w-3xl">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                    <span className="text-neutral-300 font-medium">{post.author.name}</span>
                    <span>—</span>
                    <span>{post.author.role}</span>
                  </div>

                  <div className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-neutral-400 group-hover:text-white group-hover:translate-x-1 transition-all">
                    <span>Read Entry</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
