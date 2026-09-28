import Link from "next/link";
import { Layers } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1a1a1a] bg-[#0a0a0a]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-6 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90" aria-label="BuildScape home">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-700/50 bg-amber-950/40 shadow-sm">
            <Layers className="h-4 w-4 text-[#c9a96e]" />
          </div>
          <span className="font-serif text-lg font-bold tracking-tight text-[#e4ddd3]">
            BuildScape
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          <Link
            href="/projects"
            className="rounded-md px-3.5 py-1.5 text-xs text-[#8a8178] transition-colors hover:text-[#e4ddd3]"
          >
            Projects
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 rounded-md border border-amber-700/50 bg-amber-950/40 px-3.5 py-1.5 text-xs font-semibold text-[#e8c88a] shadow-sm transition-all hover:bg-amber-900/50 hover:text-amber-100"
          >
            Start building &rarr;
          </Link>
        </nav>
      </div>
    </header>
  );
}
