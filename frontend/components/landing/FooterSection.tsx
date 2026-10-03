import Link from "next/link";
import { Layers } from "lucide-react";

const NAV = [
  { label: "Projects", href: "/projects" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export function FooterSection() {
  return (
    <footer className="border-t border-[#1e1e1c] py-10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 sm:px-8 lg:px-12">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded border border-[#2a2620] bg-[#161411]">
            <Layers className="h-3 w-3 text-[#c9a96e]" />
          </div>
          <span className="font-serif text-sm font-semibold text-[#5a5450]">BuildScape</span>
        </div>

        {/* Nav */}
        <nav className="flex gap-7">
          {NAV.map(({ label, href }) => (
            <Link key={label} href={href} className="text-xs text-[#5a5450] transition-colors hover:text-[#c8c0b4]">
              {label}
            </Link>
          ))}
        </nav>

        {/* Tagline */}
        <span className="text-xs text-[#3a3830]">Built for developers who learn by doing</span>
      </div>
    </footer>
  );
}
