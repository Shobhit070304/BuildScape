import Link from "next/link";
import { Logo } from "@/components/Logo";

const NAV = [
  { label: "Blueprints", href: "/projects" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Architecture Bento", href: "#features" },
  { label: "FAQ", href: "#faq" },
];

export function FooterSection() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#050507] py-14">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Logo size="sm" />

        {/* Nav Links */}
        <nav className="flex flex-wrap items-center gap-6 sm:gap-8">
          {NAV.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-xs font-medium text-neutral-400 transition-colors hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Tagline */}
        <span className="text-xs text-neutral-500 font-mono">
          Engineered for developers who learn through building
        </span>
      </div>
    </footer>
  );
}
