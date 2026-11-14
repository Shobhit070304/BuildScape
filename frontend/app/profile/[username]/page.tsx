"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Calendar,
  Globe,
  Layers,
  CheckCircle2,
  ExternalLink,
  Pencil,
  ArrowLeft,
  Loader2,
} from "lucide-react";

function GithubIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function TwitterIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.46 1.46 0 1 0 0-2.92 1.46 1.46 0 0 0 0 2.92M7.85 18.5V10.13H5.06v8.37h2.79z" />
    </svg>
  );
}
import { Navbar } from "@/components/Navbar";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { useAuth } from "@/context/AuthContext";
import {
  api,
  type PublicUserProfile,
  type PublicUserStats,
  type PublicUserProject,
} from "@/lib/api";

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [stats, setStats] = useState<PublicUserStats | null>(null);
  const [projects, setProjects] = useState<PublicUserProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    api
      .getPublicProfile(username)
      .then((res) => {
        if (!cancelled) {
          setProfile(res.profile);
          setStats(res.stats);
          setProjects(res.projects || []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "User profile not found");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-neutral-500">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400 mb-2" />
          <p className="text-xs font-mono">Loading developer profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#050507] text-white">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <p className="text-sm text-red-400 mb-4">{error || "Profile not found"}</p>
          <Link
            href="/discussions"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Community</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.username === profile.username;
  const joinedDate = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#050507] text-white relative overflow-hidden">
      <Navbar />

      {/* Ambient Gradient Lighting */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[450px] w-full max-w-5xl -translate-x-1/2 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.15),rgba(147,51,234,0.06)_40%,transparent_75%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-[-5%] top-[25%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.05)_0%,transparent_70%)] blur-[100px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-[-5%] top-[55%] h-[450px] w-[450px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.05)_0%,transparent_70%)] blur-[110px]"
        aria-hidden="true"
      />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 relative">
        {/* Profile Card Header */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0E] shadow-2xl">
          {/* Subtle Ambient Background Banner */}
          <div className="h-32 w-full bg-gradient-to-r from-neutral-900 via-indigo-950/20 to-neutral-900 border-b border-white/[0.08]" />

          {/* Profile Header Content */}
          <div className="px-6 pb-6 pt-0 sm:px-8">
            <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
              {/* Avatar */}
              <div className="relative">
                {profile.avatar ? (
                  <Image
                    src={profile.avatar}
                    alt={profile.name}
                    width={96}
                    height={96}
                    className="rounded-2xl ring-4 ring-[#0A0A0E] object-cover bg-neutral-900"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-2xl bg-gradient-to-tr from-indigo-900 to-neutral-800 ring-4 ring-[#0A0A0E] flex items-center justify-center text-2xl font-bold text-white shadow-xl">
                    {profile.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                {isOwnProfile && (
                  <Link
                    href="/profile?tab=account"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/[0.08] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white hover:text-black transition-all cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit Profile</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Name & Handle */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {profile.name}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 font-mono">
                @{profile.username}
              </p>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="mt-3 text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Location & Joined Date */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-neutral-400">
              {profile.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-neutral-500" />
                  <span>{profile.location}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                <span>Joined {joinedDate}</span>
              </span>
            </div>

            {/* Social Links */}
            {(profile.githubUrl || profile.twitterUrl || profile.portfolioUrl || profile.linkedinUrl) && (
              <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-white/[0.06]">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-neutral-300 hover:text-white hover:border-white/20 transition-colors"
                  >
                    <GithubIcon className="h-3.5 w-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
                {profile.twitterUrl && (
                  <a
                    href={profile.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-neutral-300 hover:text-white hover:border-white/20 transition-colors"
                  >
                    <TwitterIcon className="h-3.5 w-3.5" />
                    <span>Twitter / X</span>
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-neutral-300 hover:text-white hover:border-white/20 transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>Portfolio</span>
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-neutral-300 hover:text-white hover:border-white/20 transition-colors"
                  >
                    <LinkedinIcon className="h-3.5 w-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            )}

            {/* Skills & Tech Stack Chips */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-3 border-t border-white/[0.06]">
                <span className="text-[11px] text-neutral-500 font-medium mr-1">Skills:</span>
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-mono text-neutral-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quantified Stats Strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-white/10 bg-[#0A0A0E] p-4 text-center">
            <span className="block text-2xl font-bold font-mono text-white">
              {stats?.completedProjectsCount ?? 0}
            </span>
            <span className="text-xs text-neutral-400 mt-1 block">Completed Projects</span>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0A0A0E] p-4 text-center">
            <span className="block text-2xl font-bold font-mono text-white">
              {stats?.enrolledProjectsCount ?? 0}
            </span>
            <span className="text-xs text-neutral-400 mt-1 block">In-Progress Builds</span>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0A0A0E] p-4 text-center">
            <span className="block text-2xl font-bold font-mono text-white">
              {stats?.discussionsCount ?? 0}
            </span>
            <span className="text-xs text-neutral-400 mt-1 block">Discussions Started</span>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0A0A0E] p-4 text-center">
            <span className="block text-2xl font-bold font-mono text-emerald-400">
              {stats?.solutionsCount ?? 0}
            </span>
            <span className="text-xs text-neutral-400 mt-1 block">Accepted Solutions</span>
          </div>
        </div>

        {/* Daily Building Heatmap & Coding Streak */}
        <div className="mt-6">
          <ActivityHeatmap username={profile.username} />
        </div>

        {/* Projects Showcase Section */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              <span>Projects Showcase ({projects.length})</span>
            </h2>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center text-xs text-neutral-400">
              No projects started yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((p) => {
                return (
                  <div
                    key={p.slug}
                    className="group rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-5 transition-all hover:border-white/20 hover:bg-[#0E0E14]"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Link
                        href={`/projects/${p.slug}`}
                        className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1"
                      >
                        {p.title}
                      </Link>

                      {p.isCompleted ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-neutral-400 font-mono">
                          In Progress
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {p.shortDescription}
                    </p>

                    {/* Tech Stack Chips */}
                    {p.techStack && p.techStack.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-1">
                        {p.techStack.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="rounded border border-white/10 bg-white/[0.02] px-1.5 py-0.5 text-[10px] font-mono text-neutral-400"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Links */}
                    {(p.githubRepoUrl || p.liveDemoUrl) && (
                      <div className="mt-4 flex items-center gap-3 pt-3 border-t border-white/[0.05] text-xs">
                        {p.githubRepoUrl && (
                          <a
                            href={p.githubRepoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
                          >
                            <GithubIcon className="h-3 w-3" />
                            <span>Repository</span>
                          </a>
                        )}
                        {p.liveDemoUrl && (
                          <a
                            href={p.liveDemoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Live Demo</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
