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
import { GithubIcon, TwitterIcon, LinkedinIcon } from "@/components/icons/SocialIcons";
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
      <div className="min-h-screen bg-bg text-white">
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
      <div className="min-h-screen bg-bg text-white">
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
    <div className="min-h-screen bg-bg text-white relative overflow-hidden">
      <Navbar />

      {/* Ambient Gradient Lighting */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-112.5 w-full max-w-5xl -translate-x-1/2 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.15),rgba(147,51,234,0.06)_40%,transparent_75%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-[-5%] top-[25%] h-100 w-100 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.05)_0%,transparent_70%)] blur-[100px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-[-5%] top-[55%] h-112.5 w-112.5 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.05)_0%,transparent_70%)] blur-[110px]"
        aria-hidden="true"
      />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 relative">
        {/* Profile Card Header */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0E] shadow-2xl">
          {/* Subtle Ambient Background Banner */}
          <div className="h-32 w-full bg-linear-to-r from-neutral-900 via-indigo-950/20 to-neutral-900 border-b border-white/8" />

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
                  <div className="h-24 w-24 rounded-2xl bg-linear-to-tr from-indigo-900 to-neutral-800 ring-4 ring-[#0A0A0E] flex items-center justify-center text-2xl font-bold text-white shadow-xl">
                    {profile.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                {isOwnProfile && (
                  <Link
                    href="/profile?tab=account"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/8 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white hover:text-black transition-all cursor-pointer"
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
              <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-white/6">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/3 px-2.5 py-1 text-xs text-neutral-300 hover:text-white hover:border-white/20 transition-colors"
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
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/3 px-2.5 py-1 text-xs text-neutral-300 hover:text-white hover:border-white/20 transition-colors"
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
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/3 px-2.5 py-1 text-xs text-neutral-300 hover:text-white hover:border-white/20 transition-colors"
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
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/3 px-2.5 py-1 text-xs text-neutral-300 hover:text-white hover:border-white/20 transition-colors"
                  >
                    <LinkedinIcon className="h-3.5 w-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            )}

            {/* Skills & Tech Stack Chips */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-3 border-t border-white/6">
                <span className="text-[11px] text-neutral-500 font-medium mr-1">Skills:</span>
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md border border-white/10 bg-white/4 px-2 py-0.5 text-[11px] font-mono text-neutral-300"
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
            <div className="rounded-xl border border-white/10 bg-white/2 p-8 text-center text-xs text-neutral-400">
              No projects started yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((p) => {
                return (
                  <div
                    key={p.slug}
                    className="group rounded-xl border border-white/8 bg-[#0A0A0E] p-5 transition-all hover:border-white/20 hover:bg-surface-card"
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
                        <span className="rounded-md border border-white/10 bg-white/4 px-2 py-0.5 text-[10px] text-neutral-400 font-mono">
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
                            className="rounded border border-white/10 bg-white/2 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400"
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
