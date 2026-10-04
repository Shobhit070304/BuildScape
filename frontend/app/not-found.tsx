import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ChevronLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-[80vh] w-full bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="max-w-md text-center py-20">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-800/40 bg-amber-950/30">
            <Compass className="h-8 w-8 text-accent animate-pulse" />
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">
            404 ERROR
          </span>
          <h1 className="font-serif text-3xl font-bold text-text mt-2 mb-3">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-8">
            The page you are looking for doesn&rsquo;t exist, was removed, or is temporarily unavailable.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-[#14120f] px-4 py-2 text-xs font-medium text-text transition-colors hover:border-border-hover hover:bg-[#1c1915]"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Return Home
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-700/60 bg-amber-950/60 px-4 py-2 text-xs font-semibold text-text transition-all hover:bg-amber-900/60 hover:text-white"
            >
              Browse Projects
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
