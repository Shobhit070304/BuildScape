"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Globe,
  Copy,
  Check,
  ExternalLink,
  X,
  Loader2,
  Sparkles,
  Award,
} from "lucide-react";
import { api, getApiUrl } from "@/lib/api";

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

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectSlug: string;
  projectTitle: string;
  isVerified?: boolean;
  verifiedAt?: string;
  initialGithubUrl?: string;
  initialDemoUrl?: string;
  username?: string;
  onVerifiedSuccess?: () => void;
}

export function VerificationModal({
  isOpen,
  onClose,
  projectSlug,
  projectTitle,
  isVerified = false,
  verifiedAt,
  initialGithubUrl = "",
  initialDemoUrl = "",
  username,
  onVerifiedSuccess,
}: VerificationModalProps) {
  const [githubUrl, setGithubUrl] = useState(initialGithubUrl);
  const [demoUrl, setDemoUrl] = useState(initialDemoUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [justVerified, setJustVerified] = useState(false);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const [challengeLoading, setChallengeLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setChallenge(null);
    setChallengeLoading(true);
    setChallengeError(null);
    api.getVerificationChallenge(projectSlug)
      .then(({ challenge: value }) => {
        if (active) setChallenge(value);
      })
      .catch((err: unknown) => {
        if (active) setChallengeError(err instanceof Error ? err.message : "Could not load repository challenge");
      })
      .finally(() => {
        if (active) setChallengeLoading(false);
      });
    return () => { active = false; };
  }, [isOpen, projectSlug]);

  if (!isOpen) return null;

  const currentVerified = isVerified || justVerified;
  const userHandle = username || "developer";
  const badgeUrl = `${getApiUrl()}/api/badges/${userHandle}/${projectSlug}.svg`;
  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/u/${userHandle}` : `/u/${userHandle}`;
  const markdownSnippet = `[![BuildScape Verified](${badgeUrl})](${profileUrl})`;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedGithub = githubUrl.trim();
    if (!trimmedGithub) {
      setError("Please enter your GitHub repository URL");
      return;
    }

    setLoading(true);
    try {
      await api.verifyProject(projectSlug, {
        githubRepoUrl: trimmedGithub,
        liveDemoUrl: demoUrl.trim() || undefined,
      });
      setJustVerified(true);
      if (onVerifiedSuccess) onVerifiedSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed. Please check the repository URL.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#2b2720] bg-linear-to-b from-[#161411] to-[#0e0d0b] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-[#8a8178] transition-colors hover:bg-[#221f1a] hover:text-[#e4ddd3] cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-800/40 bg-emerald-950/40 shadow-xs">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-bold text-[#e4ddd3]">
                Phase & Repository Verification
              </h2>
              {currentVerified && (
                <span className="rounded-full border border-emerald-700/50 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-[#8a8178] mt-0.5 line-clamp-1">
              {projectTitle}
            </p>
          </div>
        </div>

        {/* Verified Showcase / Embed state */}
        {currentVerified ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-1">
                <Sparkles className="h-4 w-4" />
                <span>Project Progress & Repository Verified</span>
              </div>
              <p className="text-xs text-[#a0978c] leading-relaxed">
                BuildScape confirmed your completed phases and access to this public repository. Source code quality is not automatically reviewed. Add the badge to your GitHub README.
              </p>
              {verifiedAt && (
                <p className="mt-2 text-[11px] text-[#6b6256] font-mono">
                  Verified on {new Date(verifiedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              )}
            </div>

            {/* Badge Preview */}
            <div className="rounded-xl border border-[#221f1a] bg-[#11100e] p-3.5">
              <div className="flex items-center justify-between text-xs text-[#8a8178] mb-2 font-mono">
                <span>README Live Badge</span>
                <span className="text-[11px] text-emerald-400">Live dynamic SVG</span>
              </div>
              <div className="flex items-center justify-center py-2 bg-[#0c0c0d] rounded-lg border border-[#1e1e22]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={badgeUrl} alt="BuildScape Verified" className="h-7" />
              </div>

              {/* Copy snippet */}
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={markdownSnippet}
                  className="w-full rounded-lg border border-[#2a2620] bg-[#161411] px-3 py-1.5 font-mono text-[11px] text-accent focus:outline-hidden"
                />
                <button
                  onClick={handleCopy}
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-amber-700/50 bg-amber-950/40 hover:bg-amber-900/50 px-3 py-1.5 text-xs font-medium text-accent transition-all cursor-pointer"
                  title="Copy markdown code"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Profile CTA */}
            <div className="flex items-center gap-2 pt-2">
              <Link
                href={`/u/${userHandle}`}
                target="_blank"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-600/50 bg-[#d97706] hover:bg-[#b45309] px-4 py-2 text-xs font-semibold text-stone-950 transition-all shadow-xs"
              >
                <Award className="h-3.5 w-3.5" />
                <span>View My Public Developer Profile</span>
                <ExternalLink className="h-3 w-3 ml-0.5 opacity-80" />
              </Link>
              <button
                onClick={() => setJustVerified(false)}
                className="rounded-lg border border-[#2a2620] bg-transparent hover:bg-[#1a1814] px-3 py-2 text-xs text-[#8a8178] transition-colors cursor-pointer"
              >
                Update URL
              </button>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-xs text-[#8a8178] leading-relaxed">
              Link a public repository you can edit. We check your completed phases and confirm the repository contains your unique BuildScape challenge; we do not automatically review its source code.
            </p>

            <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-3 text-xs text-[#c4bbb0]">
              <p className="mb-2 font-medium text-amber-300">Prove repository access</p>
              <p className="mb-2 text-[11px] leading-relaxed text-[#a0978c]">
                Create <code className="text-amber-200">.buildscape-verification</code> in the repository root and paste this exact line into it:
              </p>
              {challengeLoading ? (
                <p className="font-mono text-[11px] text-[#8a8178]">Loading your unique challenge…</p>
              ) : challenge ? (
                <code className="block break-all rounded border border-[#2a2620] bg-[#11100e] p-2 font-mono text-[11px] text-emerald-300">
                  {challenge}
                </code>
              ) : (
                <p className="text-[11px] text-red-300">{challengeError ?? "Challenge unavailable"}</p>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-2.5 text-xs text-red-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#e4ddd3] mb-1.5">
                GitHub Repository URL <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <GithubIcon className="absolute left-3 top-2.5 h-4 w-4 text-[#8a8178]" />
                <input
                  type="url"
                  required
                  placeholder="https://github.com/your-username/distributed-cache"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full rounded-lg border border-[#2a2620] bg-[#11100e] pl-9 pr-3 py-2 text-xs text-[#e4ddd3] placeholder-[#5a5349] focus:border-amber-700/60 focus:outline-hidden"
                />
              </div>
              <p className="mt-1 text-[11px] text-[#6b6256]">
                Must be a public repository containing your project code.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#e4ddd3] mb-1.5">
                Live Demo / Deployment URL <span className="text-[#6b6256]">(Optional)</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-[#8a8178]" />
                <input
                  type="url"
                  placeholder="https://my-app.vercel.app"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="w-full rounded-lg border border-[#2a2620] bg-[#11100e] pl-9 pr-3 py-2 text-xs text-[#e4ddd3] placeholder-[#5a5349] focus:border-amber-700/60 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
              disabled={loading || challengeLoading || !challenge}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-600/50 bg-[#d97706] hover:bg-[#b45309] px-4 py-2.5 text-xs font-semibold text-stone-950 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying with GitHub...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verify Phases & Repository</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
