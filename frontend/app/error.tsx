"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <>
      <Navbar />
      <main className="min-h-[80vh] w-full bg-[#050507] flex items-center justify-center px-4">
        <div className="max-w-md text-center py-20">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-900/40 bg-rose-950/20">
            <AlertTriangle className="h-8 w-8 text-rose-400" />
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-rose-400 font-semibold">
            ERROR
          </span>
          <h1 className="font-serif text-3xl font-bold text-white mt-2 mb-3">
            Something went wrong
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-8">
            An unexpected error occurred while communicating with the service. Please try reloading or return home.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black shadow-sm transition-all hover:bg-neutral-200 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0A0A0E] px-4 py-2 text-xs font-medium text-neutral-300 transition-colors hover:border-white/20 hover:text-white"
            >
              <Home className="h-3.5 w-3.5" />
              Return Home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
