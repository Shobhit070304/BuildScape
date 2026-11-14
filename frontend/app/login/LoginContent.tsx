"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { AuthConstellation } from "@/components/auth/AuthConstellation";

export function LoginContent() {
  const { user, isLoading: authLoading, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/profile";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect straight to target page
  useEffect(() => {
    if (user && !authLoading) {
      router.replace(nextUrl);
    }
  }, [user, authLoading, nextUrl, router]);

  const handleGoogleSuccess = async (credential?: string) => {
    if (!credential) {
      setError("No credential token returned from Google. Please try again.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await login(credential);
      router.replace(nextUrl);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Google authentication failed. Please try again.";
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050507] text-white selection:bg-indigo-500/30 selection:text-indigo-200 flex items-center justify-center p-3 sm:p-4 lg:p-6 overflow-x-hidden">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none fixed top-1/4 left-1/4 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.06)_0%,transparent_70%)] blur-[100px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed bottom-1/4 right-1/4 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.05)_0%,transparent_70%)] blur-[100px]"
        aria-hidden="true"
      />

      {/* ───────────────── COMMON WRAPPER BOX FOR BOTH SIDES ───────────────── */}
      <div className="relative z-10 w-full max-w-5xl xl:max-w-6xl rounded-3xl border border-white/[0.08] bg-[#07070A] shadow-2xl shadow-black/80 overflow-hidden grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
        {/* ── LEFT SIDE: MINIMAL AUTHENTICATION ── */}
        <section className="flex flex-col justify-between p-6 sm:p-10 lg:p-12 min-h-[460px] lg:min-h-[580px]">
          {/* Top: Logo & Return (Kept exactly as it is) */}
          <div className="flex items-center justify-between w-full">
            <Logo size="md" />
            <Link
              href="/"
              className="group inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-xs font-medium text-neutral-400 transition-all hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back</span>
            </Link>
          </div>

          {/* Center: Centered Text & Button */}
          <div className="mx-auto my-auto w-full max-w-sm sm:max-w-md py-6 flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              Welcome to BuildScape
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xs sm:max-w-sm">
              Please sign in with your Google account to access your workspace.
            </p>

            {/* Google OAuth Button - Fully Centered */}
            <div className="mt-6 mb-2 flex flex-col items-center justify-center w-full">
              <div className="flex justify-center items-center">
                <div className="rounded-full bg-white p-0.5 shadow-md transition-transform hover:scale-[1.01]">
                  <GoogleLogin
                    onSuccess={(res) => {
                      if (res.credential) void handleGoogleSuccess(res.credential);
                    }}
                    onError={() =>
                      setError("Google authentication was interrupted. Please try again.")
                    }
                    shape="pill"
                    theme="outline"
                    size="large"
                    width="290"
                    logo_alignment="center"
                    text="signin_with"
                  />
                </div>
              </div>

              {isSubmitting && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-indigo-400 font-medium">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Signing in...</span>
                </div>
              )}

              {error && (
                <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2 max-w-xs text-left">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Empty spacer to keep center content vertically balanced with top header */}
          <div className="hidden lg:block h-6" />
        </section>

        {/* ── RIGHT SIDE: MINIMAL CONSTELLATION SHOWCASE ── */}
        <section className="relative flex flex-col justify-center bg-[#07070A] overflow-hidden min-h-[460px] lg:min-h-[580px]">
          <AuthConstellation />
        </section>
      </div>
    </div>
  );
}
