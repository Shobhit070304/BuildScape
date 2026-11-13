import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Award,
  ArrowRight,
  GitBranch,
  Globe,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { TechBadge } from "@/components/TechBadge";
import { getApiUrl, type CertificateData } from "@/lib/api";

interface VerifyPageProps {
  params: Promise<{ id: string }>;
}

async function fetchCertificate(id: string): Promise<CertificateData | null> {
  const apiUrl = getApiUrl();
  try {
    const res = await fetch(`${apiUrl}/api/projects/certificates/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json() as { certificate?: CertificateData };
    return data.certificate || null;
  } catch (err) {
    console.error("Failed to load certificate:", err);
    return null;
  }
}

export async function generateMetadata({ params }: VerifyPageProps): Promise<Metadata> {
  const { id } = await params;
  const cert = await fetchCertificate(id);
  if (!cert) {
    return {
      title: "Certificate Verification | BuildScape",
    };
  }

  return {
    title: `Verified Project: ${cert.project.title} - ${cert.recipient.name} | BuildScape`,
    description: `Official BuildScape verification for ${cert.recipient.name} completing the ${cert.project.title} production project.`,
    openGraph: {
      title: `BuildScape Verified: ${cert.project.title}`,
      description: `Verified production build completed by ${cert.recipient.name}. Built with ${cert.project.techStack.join(", ")}.`,
    },
  };
}

export default async function CertificateVerificationPage({ params }: VerifyPageProps) {
  const { id } = await params;
  const cert = await fetchCertificate(id);

  if (!cert) {
    notFound();
  }

  const formattedDate = new Date(cert.verifiedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    `https://buildscape.dev/verify/${cert.certificateId}`
  )}`;

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `I just built and verified "${cert.project.title}" on @BuildScape! Check out my verified production deliverable: https://buildscape.dev/verify/${cert.certificateId}`
  )}`;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#050507] pb-24 pt-8 text-neutral-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Top Verification Status Pill */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/20 px-3.5 py-1 text-xs font-medium text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>Official Verification of Production Competence</span>
            </div>

            <span className="font-mono text-xs text-neutral-400">
              Record ID: <strong className="text-white">{cert.certificateId}</strong>
            </span>
          </div>

          {/* Main Certificate Artifact Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0E] p-6 sm:p-10 shadow-2xl shadow-black/90">
            {/* Top ambient highlight line */}
            <div className="pointer-events-none absolute -top-24 left-1/2 h-44 w-96 -translate-x-1/2 rounded-full bg-white/[0.04] blur-2xl" />

            {/* Certificate Header Banner */}
            <div className="border-b border-white/[0.08] pb-8 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.05] text-white">
                <Award className="h-8 w-8" />
              </div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-400">
                BUILDSCAPE ENGINEERING STANDARD
              </span>
              <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-white">
                Certificate of Completed Architecture
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
                This certifies that the developer below has successfully built, verified, and shipped the production architecture described herein.
              </p>
            </div>

            {/* Recipient Profile Section */}
            <div className="my-8 flex flex-col sm:flex-row items-center justify-between gap-5 rounded-2xl border border-white/[0.06] bg-[#07070A] p-5">
              <div className="flex items-center gap-4">
                {cert.recipient.avatar ? (
                  <Image
                    src={cert.recipient.avatar}
                    alt={cert.recipient.name}
                    width={56}
                    height={56}
                    className="rounded-full border border-white/20 shrink-0"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.06] font-serif text-xl font-bold text-white">
                    {cert.recipient.name[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="font-serif text-lg font-bold text-white">
                    {cert.recipient.name}
                  </h2>
                  <p className="font-mono text-xs text-neutral-400">
                    {cert.recipient.username ? `@${cert.recipient.username}` : "Verified Builder"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
                <span>Verified On:</span>
                <span className="font-semibold text-white">{formattedDate}</span>
              </div>
            </div>

            {/* Project Overview Specs */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2 font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
                  <span>{cert.project.track}</span>
                  <span>•</span>
                  <span>{cert.project.difficulty} Level</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white mb-2">
                  {cert.project.title}
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed max-w-2xl">
                  {cert.project.tagline}
                </p>
              </div>

              {/* Verified Tech Stack */}
              <div>
                <span className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400 mb-2.5">
                  Verified Technologies &amp; Architecture
                </span>
                <div className="flex flex-wrap gap-2">
                  {cert.project.techStack.map((tech) => (
                    <TechBadge key={tech} name={tech} />
                  ))}
                </div>
              </div>

              {/* Deliverable description */}
              {cert.project.deliverable && (
                <div className="rounded-xl border border-white/[0.08] bg-[#050507] p-4 text-xs text-neutral-300 leading-relaxed">
                  <span className="block font-semibold text-white mb-1">
                    Deployed Production Deliverable
                  </span>
                  {cert.project.deliverable}
                </div>
              )}

              {/* 3-Point Verified Proof Checklist */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/15 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verified Proof of Work Audit</span>
                </div>
                <div className="space-y-2">
                  {(cert.verificationDetails?.verifiedChecks || [
                    "Public source code inspected and verified",
                    "Architectural fingerprint signature confirmed",
                    "Author commits and history validated",
                  ]).map((check, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{check}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Links to Source Code and Live App */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <a
                  href={cert.githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-neutral-200 transition-all shadow-sm"
                >
                  <GitBranch className="h-4 w-4" />
                  <span>Inspect Verified Source Code</span>
                  <ExternalLink className="h-3 w-3" />
                </a>

                {cert.liveDemoUrl && (
                  <a
                    href={cert.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/[0.08] transition-all"
                  >
                    <Globe className="h-4 w-4" />
                    <span>View Live Deployment</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Footer Cryptographic / Authenticity Proof */}
            <div className="mt-10 border-t border-white/[0.08] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-white" />
                <span>Verified by BuildScape Automated Static Signature Verifier</span>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={linkedInShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Share to LinkedIn
                </a>
                <span>•</span>
                <a
                  href={twitterShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Share to X
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Back Navigation */}
          <div className="mt-8 text-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              <span>Explore More Production Projects</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
