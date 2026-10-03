import Link from "next/link";
import { Logo } from "@/components/Logo";

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
        <Logo size="sm" />

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
