"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Globe,
  ExternalLink,
  X,
  Loader2,
  Award,
} from "lucide-react";
import { api } from "@/lib/api";

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
  const [justVerified, setJustVerified] = useState(false);
  const [editingExisting, setEditingExisting] = useState(false);

  if (!isOpen) return null;

  const currentVerified = (isVerified && !editingExisting) || justVerified;
  const userHandle = username || "developer";

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedGithub = githubUrl.trim();
    if (!trimmedGithub) {
      setError("Please enter your GitHub repository URL");
      return;
    }

    if (!trimmedGithub.includes("github.com/")) {
      setError("URL must be a public GitHub repository (e.g., https://github.com/username/repo)");
      return;
    }

    setLoading(true);
    try {
      await api.verifyProject(projectSlug, {
        githubRepoUrl: trimmedGithub,
        liveDemoUrl: demoUrl.trim() || undefined,
      });
      setEditingExisting(false);
      setJustVerified(true);
      if (onVerifiedSuccess) onVerifiedSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed. Please check the repository URL.";
      setError(message);
    } finally {
      setLoading(false);
    }
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
                Public Repository Link
              </h2>
              {currentVerified && (
                <span className="rounded-full border border-emerald-700/50 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  Public repo checked
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
                <ShieldCheck className="h-4 w-4" />
                <span>Public repository checked</span>
              </div>
              <p className="text-xs text-[#a0978c] leading-relaxed">
                The submitted GitHub URL is a public repository and is listed on your developer profile. BuildScape does not check repository ownership or contents.
              </p>
              {verifiedAt && (
                <p className="mt-2 text-[11px] text-[#6b6256] font-mono">
                  Checked on {new Date(verifiedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              )}
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
                onClick={() => { setJustVerified(false); setEditingExisting(true); }}
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
              Link a public GitHub repository to your developer profile. BuildScape checks that the repository is public; it does not check ownership or contents.
            </p>

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
                The URL must point to a public GitHub repository. Make sure it contains your project code.
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
                disabled={loading}
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
                    <span>Check & Link Repository</span>
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
