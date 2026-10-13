import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ShieldCheck,
  Globe,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Award,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { DIFFICULTY_COLORS, getTrackColor } from "@/lib/projects";
import { getApiUrl, PublicUserProfile } from "@/lib/api";

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

interface PageProps {
  params: Promise<{ username: string }>;
}

async function fetchPublicProfile(username: string): Promise<PublicUserProfile | null> {
  const apiUrl = getApiUrl();
  try {
    const res = await fetch(`${apiUrl}/api/users/${encodeURIComponent(username)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await fetchPublicProfile(username);
  if (!profile) {
    return {
      title: "Developer Profile | BuildScape",
      description: "Public developer profile on BuildScape.",
    };
  }

  const title = `${profile.user.name} (@${profile.user.username}) • Verified Builds | BuildScape`;
  const description = `Explore verified production-grade builds and engineering proof-of-work by ${profile.user.name} on BuildScape. ${profile.stats.verifiedBuildsCount} verified projects, ${profile.stats.totalEngineeringHours} engineering hours completed.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/u/${profile.user.username}`,
    },
    openGraph: {
      title,
      description,
      type: "profile",
      siteName: "BuildScape",
      images: profile.user.avatar ? [profile.user.avatar] : ["/icon.svg"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: profile.user.avatar ? [profile.user.avatar] : ["/icon.svg"],
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const profile = await fetchPublicProfile(username);

  if (!profile) {
    notFound();
  }

  const { user, stats, verifiedProjects } = profile;
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${user.name} (@${user.username})`,
    mainEntity: {
      "@type": "Person",
      name: user.name,
      alternateName: `@${user.username}`,
      image: user.avatar,
      description: `Software developer with ${stats.verifiedBuildsCount} verified builds and ${stats.totalEngineeringHours} engineering hours completed on BuildScape.`,
      knowsAbout: stats.masteredTechStack,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen w-full bg-[#0a0a0a] pb-24 pt-8 text-[#e4ddd3]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Header Card */}
          <div className="relative overflow-hidden rounded-2xl border border-[#23201a] bg-linear-to-b from-[#151310] via-[#100f0d] to-[#0a0a09] p-6 sm:p-8 shadow-xl">
            {/* Ambient background glow */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-600/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-600/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              {/* Profile identity */}
              <div className="flex items-center gap-4">
                {user.avatar ? (
                  <div className="relative">
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={68}
                      height={68}
                      className="rounded-full border-2 border-amber-600/40 shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-[#0a0a09] bg-emerald-500 text-stone-950 shadow-xs" title="Verified Proof-of-Work Builder">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                  </div>
                ) : (
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-600/40 bg-amber-950/60 font-serif text-2xl font-bold text-accent shadow-md">
                    {user.name[0]?.toUpperCase()}
                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-[#0a0a09] bg-emerald-500 text-stone-950 shadow-xs">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#f4eee6]">
                      {user.name}
                    </h1>
                    <span className="flex items-center gap-1 rounded-full border border-emerald-800/50 bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Verified Builder
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#8a8178]">
                    <span className="font-mono text-accent">@{user.username}</span>
                    {joinedDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-[#6b6256]" />
                        Member since {joinedDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Link to Explore */}
              <div className="flex items-center gap-2.5">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#2c2822] bg-[#161411] px-3.5 py-2 text-xs font-medium text-accent transition-all hover:border-amber-700/50 hover:bg-[#1f1c17] hover:text-white"
                >
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  <span>Explore Curriculum</span>
                </Link>
              </div>
            </div>

            {/* Metrics Bar */}
            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-[#1f1c17] pt-5 sm:grid-cols-3">
              <div className="rounded-xl border border-[#221f1a] bg-[#11100e]/80 p-3.5">
                <span className="text-[10px] uppercase tracking-wider text-[#6b6256] font-mono">
                  Verified Builds
                </span>
                <p className="mt-1 font-mono text-2xl font-bold text-emerald-400">
                  {stats.verifiedBuildsCount}
                </p>
              </div>

              <div className="rounded-xl border border-[#221f1a] bg-[#11100e]/80 p-3.5">
                <span className="text-[10px] uppercase tracking-wider text-[#6b6256] font-mono">
                  Engineering Hours
                </span>
                <p className="mt-1 font-mono text-2xl font-bold text-accent">
                  {stats.totalEngineeringHours}h
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-xl border border-[#221f1a] bg-[#11100e]/80 p-3.5">
                <span className="text-[10px] uppercase tracking-wider text-[#6b6256] font-mono">
                  Tech Stacks Mastered
                </span>
                <p className="mt-1 font-mono text-2xl font-bold text-[#e4ddd3]">
                  {stats.masteredTechStack.length}
                </p>
              </div>
            </div>

            {/* Mastered Tech Stack Badges */}
            {stats.masteredTechStack.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[11px] text-[#6b6256]">Skills:</span>
                {stats.masteredTechStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md border border-[#27231c] bg-[#14120f] px-2 py-0.5 font-mono text-[11px] text-[#a0978c]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Verified Projects Showcase */}
          <div className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#f4eee6] flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  <span>Verified Proof-of-Work Projects</span>
                </h2>
                <p className="text-xs text-[#8a8178] mt-0.5">
                  Production-grade systems built and verified end-to-end.
                </p>
              </div>
            </div>

            {verifiedProjects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#23201a] bg-[#11100e] p-10 text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[#28241e] bg-[#161411]">
                  <Layers className="h-5 w-5 text-[#6b6256]" />
                </div>
                <h3 className="font-serif text-sm font-semibold text-[#e4ddd3]">
                  No Verified Projects Yet
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-xs text-[#8a8178]">
                  This developer has not yet submitted a verified project to their public portfolio.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {verifiedProjects.map((project) => {
                  const diffColor =
                    DIFFICULTY_COLORS[project.difficulty] ??
                    "text-amber-400 bg-amber-950/60 border-amber-900";
                  const trackColor = getTrackColor(project.track);
                  const badgeEndpoint = `${getApiUrl()}/api/badges/${user.username}/${project.slug}.svg`;

                  return (
                    <div
                      key={project.slug}
                      className="flex flex-col justify-between rounded-xl border border-[#221f1a] bg-linear-to-b from-[#12110e] to-[#0e0d0b] p-5 shadow-sm transition-all hover:border-[#332e26]"
                    >
                      <div>
                        {/* Meta tags */}
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`rounded border px-2 py-0.5 text-[10px] font-medium ${trackColor}`}
                            >
                              {project.track}
                            </span>
                            <span
                              className={`rounded border px-2 py-0.5 text-[10px] font-medium ${diffColor}`}
                            >
                              {project.difficulty}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-[11px] text-[#6b6256] font-mono">
                            <Clock className="h-3 w-3" />
                            {project.estimatedHours}h
                          </span>
                        </div>

                        {/* Title & Tagline */}
                        <h3 className="font-serif text-base font-bold text-[#f4eee6] mb-1.5">
                          {project.title}
                        </h3>
                        <p className="text-xs text-[#8a8178] leading-relaxed mb-4">
                          {project.tagline}
                        </p>

                        {/* Tech Stack pills */}
                        <div className="mb-4 flex flex-wrap gap-1.5">
                          {project.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="rounded border border-[#24201a] bg-[#14120f] px-2 py-0.5 font-mono text-[10px] text-[#9a9186]"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        {/* Verified Proof Banner */}
                        <div className="mb-4 rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-2.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Proof-of-Work Verified
                            </span>
                            {project.verifiedAt && (
                              <span className="text-[#6b6256] font-mono text-[10px]">
                                {new Date(project.verifiedAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Project Links / Proof Actions */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1c1a16]">
                        {project.githubRepoUrl && (
                          <a
                            href={project.githubRepoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-lg border border-[#2a2620] bg-[#151310] hover:bg-[#1c1914] hover:border-amber-700/50 px-3 py-1.5 text-xs font-medium text-[#e4ddd3] transition-all cursor-pointer"
                          >
                            <GithubIcon className="h-3.5 w-3.5 text-accent" />
                            <span>GitHub Repo</span>
                          </a>
                        )}

                        {project.liveDemoUrl && (
                          <a
                            href={project.liveDemoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-lg border border-[#2a2620] bg-[#151310] hover:bg-[#1c1914] px-3 py-1.5 text-xs font-medium text-[#a0978c] hover:text-[#e4ddd3] transition-all cursor-pointer"
                          >
                            <Globe className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Live Demo</span>
                          </a>
                        )}

                        <Link
                          href={`/projects/${project.slug}`}
                          className="ml-auto flex items-center gap-1 text-xs text-[#8a8178] hover:text-accent transition-colors"
                        >
                          <span>Curriculum</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Call to Action */}
          <div className="mt-16 rounded-2xl border border-[#23201a] bg-linear-to-r from-[#14120f] to-[#100f0c] p-6 sm:p-8 text-center">
            <h3 className="font-serif text-lg font-bold text-[#f4eee6]">
              Build Production-Ready Systems. Verify Your Work.
            </h3>
            <p className="mx-auto mt-1.5 max-w-lg text-xs text-[#8a8178]">
              BuildScape teaches engineers how to construct real-world distributed architectures, cache engines, and streaming systems from scratch.
            </p>
            <div className="mt-5">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-lg border border-amber-600/50 bg-[#d97706] hover:bg-[#b45309] px-4 py-2 text-xs font-semibold text-stone-950 transition-all shadow-md"
              >
                <span>Browse All Projects</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
