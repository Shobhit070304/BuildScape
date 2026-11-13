"use client";

import { useState } from "react";
import Link from "next/link";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  Award,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";

interface ProjectVerificationModalProps {
  project: { slug: string; title: string; techStack?: string[] };
  isOpen: boolean;
  onClose: () => void;
  onVerified?: (data: {
    isVerified: boolean;
    certificateId: string;
    verifiedAt: string;
    githubRepoUrl: string;
    liveDemoUrl?: string;
  }) => void;
  existingCertificateId?: string | null;
  existingGithubUrl?: string | null;
  existingLiveUrl?: string | null;
}

export function ProjectVerificationModal({
  project,
  isOpen,
  onClose,
  onVerified,
  existingCertificateId,
  existingGithubUrl,
  existingLiveUrl,
}: ProjectVerificationModalProps) {
  const [githubUrl, setGithubUrl] = useState(existingGithubUrl || "");
  const [liveUrl, setLiveUrl] = useState(existingLiveUrl || "");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    certificateId: string;
    verifiedChecks: string[];
  } | null>(
    existingCertificateId
      ? { certificateId: existingCertificateId, verifiedChecks: ["Verified Production Build"] }
      : null
  );
  const [copiedBadge, setCopiedBadge] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim()) return;

    setVerifying(true);
    setError(null);

    try {
      const res = await api.verifyProject(project.slug, {
        githubRepoUrl: githubUrl.trim(),
        liveDemoUrl: liveUrl.trim() || undefined,
      });

      setSuccessData({
        certificateId: res.certificateId,
        verifiedChecks: res.verificationDetails?.verifiedChecks || [
          "Public repository verified",
          "Architecture fingerprint confirmed",
          "Commit history validated",
        ],
      });

      if (onVerified) {
        onVerified({
          isVerified: true,
          certificateId: res.certificateId,
          verifiedAt: res.verifiedAt,
          githubRepoUrl: res.githubRepoUrl,
          liveDemoUrl: res.liveDemoUrl,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Please ensure the repository is public.");
    } finally {
      setVerifying(false);
    }
  };

  const certificateId = successData?.certificateId || existingCertificateId;
  const verifyUrl = certificateId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${certificateId}`
    : "";

  const markdownBadge = certificateId
    ? `[![BuildScape Verified](https://img.shields.io/badge/BuildScape-Verified_Production_Build-white?style=flat&logo=github)](${verifyUrl})`
    : "";

  const copyToClipboard = async (text: string, type: "badge" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "badge") {
        setCopiedBadge(true);
        setTimeout(() => setCopiedBadge(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !verifying) onClose();
      }}
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0A0A0E] p-6 shadow-2xl shadow-black/80 text-neutral-100 sm:p-7">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={verifying}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-neutral-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {!successData ? (
          <div>
            {/* Modal Header */}
            <div className="flex items-start gap-3.5 mb-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                  PROOF OF WORK VERIFICATION
                </span>
                <h3 className="font-serif text-lg font-bold text-white mt-0.5">
                  Verify &amp; Claim Project Certificate
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Submit your public repository to run automated 3-point verification and receive your verifiable production certificate.
                </p>
              </div>
            </div>

            {/* 3-Point Checklist Explainer */}
            <div className="mb-6 rounded-xl border border-white/[0.06] bg-[#07070A] p-3.5 space-y-2 text-xs text-neutral-300">
              <div className="flex items-center gap-2 text-neutral-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Independent Work:</strong> Public repo, not a direct raw fork, with commit history.
                </span>
              </div>
              <div className="flex items-center gap-2 text-neutral-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Architecture Fingerprint:</strong> Detects project tech stack{project.techStack?.length ? ` (${project.techStack.slice(0, 3).join(", ")})` : ""}.
                </span>
              </div>
              <div className="flex items-center gap-2 text-neutral-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Authorship Attribution:</strong> Confirms author identity or &quot;BuildScape&quot; in README.
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-950/25 p-3.5 text-xs text-rose-300">
                <p className="font-medium text-rose-200">Verification check failed</p>
                <p className="mt-0.5 text-rose-300/80 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Verification Form */}
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                  GitHub Public Repository URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/your-username/spendwise"
                  className="w-full rounded-lg border border-white/10 bg-[#050507] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                  Live Deployment URL <span className="text-neutral-500 font-normal">(optional, e.g. Vercel, Fly.io, Railway)</span>
                </label>
                <input
                  type="url"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://your-project.vercel.app"
                  className="w-full rounded-lg border border-white/10 bg-[#050507] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-white/30"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={verifying}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-white/[0.04] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={verifying || !githubUrl.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 disabled:opacity-50 cursor-pointer shadow-sm transition-all"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Inspecting Repository...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Run Verification Checks</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="text-center py-2">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-400">
              <Award className="h-7 w-7" />
            </div>

            <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
              VERIFICATION COMPLETE
            </span>
            <h3 className="font-serif text-xl font-bold text-white mt-1">
              Verified Production Project
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto leading-relaxed">
              Your repository passed all 3 architectural and authorship checks. Your official proof-of-work certificate is published.
            </p>

            {/* Certificate ID Pill */}
            <div className="my-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5">
              <span className="font-mono text-xs text-neutral-400">Certificate ID:</span>
              <span className="font-mono text-xs font-bold text-white">{certificateId}</span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <Link
                href={`/verify/${certificateId}`}
                target="_blank"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-neutral-200 transition-all shadow-sm"
              >
                <Award className="h-3.5 w-3.5" />
                <span>View Official Certificate</span>
                <ExternalLink className="h-3 w-3" />
              </Link>

              <button
                type="button"
                onClick={() => copyToClipboard(verifyUrl, "link")}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#07070A] px-4 py-2.5 text-xs font-medium text-neutral-200 hover:bg-white/[0.04] hover:text-white transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedLink ? "Link Copied!" : "Copy Certificate Link"}</span>
              </button>
            </div>

            {/* Markdown Badge for README */}
            <div className="rounded-xl border border-white/[0.06] bg-[#07070A] p-3.5 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                  GitHub README Portfolio Badge
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(markdownBadge, "badge")}
                  className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white cursor-pointer"
                >
                  {copiedBadge ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedBadge ? "Copied" : "Copy Badge Markdown"}</span>
                </button>
              </div>
              <code className="block rounded bg-[#050507] border border-white/5 p-2 font-mono text-[10px] text-neutral-400 break-all select-all">
                {markdownBadge}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
