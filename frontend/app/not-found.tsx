import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ChevronLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-[80vh] w-full bg-[#050507] flex items-center justify-center px-4">
        <div className="max-w-md text-center py-20">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <Compass className="h-8 w-8 text-white animate-pulse" />
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 font-semibold">
            404 ERROR
          </span>
          <h1 className="font-serif text-3xl font-bold text-white mt-2 mb-3">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-8">
            The page you are looking for doesn&rsquo;t exist, was removed, or is temporarily unavailable.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0A0A0E] px-4 py-2 text-xs font-medium text-neutral-300 transition-colors hover:border-white/20 hover:text-white"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Return Home
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black shadow-sm transition-all hover:bg-neutral-200"
            >
              Browse Projects
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
