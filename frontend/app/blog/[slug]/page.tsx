import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Sparkles,
  Code2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { getBlogPostBySlug, getAllBlogPosts } from "@/lib/blog";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) {
    return {
      title: "Article Not Found | BuildScape",
    };
  }

  return {
    title: `${post.title} — BuildScape Engineering Log`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllBlogPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full bg-[#050507] pb-24 pt-8 text-white relative">
        {/* Subtle Obsidian Atmospheric Glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-96 w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.06),transparent_65%)]"
          aria-hidden="true"
        />

        <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative">
          {/* Breadcrumb Back Link */}
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to all entries</span>
            </Link>
          </div>

          {/* Article Header */}
          <header className="mb-10 pb-8 border-b border-white/[0.08]">
            <div className="flex items-center gap-3 font-mono text-xs text-neutral-400 mb-3.5">
              <span className="rounded border border-indigo-500/30 bg-indigo-950/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">
                {post.category}
              </span>
              <span>·</span>
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

            <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Author Byline */}
            <div className="flex items-center gap-3 pt-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] font-mono text-xs font-bold text-white">
                {post.author.name[0]}
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{post.author.name}</div>
                <div className="text-[11px] font-mono text-neutral-400">{post.author.role}</div>
              </div>
            </div>
          </header>

          {/* Article Lead Paragraph */}
          <div className="text-base sm:text-lg font-medium text-neutral-200 leading-relaxed mb-8 border-l-2 border-indigo-500/60 pl-4 bg-white/[0.02] py-2 rounded-r-lg">
            {post.content.lead}
          </div>

          {/* Main Sections Body */}
          <div className="space-y-8 text-neutral-300 text-sm sm:text-base leading-relaxed">
            {post.content.sections.map((section, idx) => (
              <section key={idx} className="space-y-4">
                {section.heading && (
                  <h2 className="font-sans text-xl sm:text-2xl font-bold text-white pt-3">
                    {section.heading}
                  </h2>
                )}

                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-neutral-300 leading-relaxed">
                    {p}
                  </p>
                ))}

                {section.callout && (
                  <div className="rounded-xl border border-indigo-500/30 bg-[#0E0E18] p-4 sm:p-5 my-4">
                    <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase font-mono tracking-wider mb-1.5">
                      <Sparkles className="h-4 w-4" />
                      <span>{section.callout.title}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                      {section.callout.text}
                    </p>
                  </div>
                )}

                {section.codeSnippet && (
                  <div className="my-5 overflow-hidden rounded-xl border border-white/[0.08] bg-[#07070A] shadow-xl">
                    <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0A0A0E] px-4 py-2 text-xs font-mono text-neutral-400">
                      <span className="flex items-center gap-1.5">
                        <Code2 className="h-3.5 w-3.5 text-neutral-400" />
                        <span>{section.codeSnippet.language}</span>
                      </span>
                      <span className="text-[10px] text-neutral-500">terminal check</span>
                    </div>
                    <pre className="p-4 text-xs font-mono text-neutral-200 overflow-x-auto leading-relaxed">
                      <code>{section.codeSnippet.code}</code>
                    </pre>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Bottom Next / Prev Navigation */}
          <div className="mt-14 pt-8 border-t border-white/[0.08]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevPost ? (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="group rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-4 transition-all hover:border-white/20 hover:bg-[#0E0E14]"
                >
                  <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" />
                    <span>Previous Entry</span>
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-neutral-100 truncate">
                    {prevPost.title}
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {nextPost && (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="group rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-4 text-right transition-all hover:border-white/20 hover:bg-[#0E0E14]"
                >
                  <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1 flex items-center justify-end gap-1">
                    <span>Next Entry</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-neutral-100 truncate">
                    {nextPost.title}
                  </div>
                </Link>
              )}
            </div>

            {/* Quick Explore Projects Banner */}
            <div className="mt-10 rounded-2xl border border-white/10 bg-[#0A0A0E] p-6 text-center shadow-xl">
              <h3 className="font-sans text-base sm:text-lg font-bold text-white mb-1.5">
                Ready to escape tutorial hell?
              </h3>
              <p className="text-xs text-neutral-400 mb-4 max-w-md mx-auto">
                Explore our hands-on curriculum across Go, React, Python, Spring Boot, and Rust.
              </p>
              <Link href="/projects" className="btn-primary text-xs">
                <span>Browse All Projects</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}

