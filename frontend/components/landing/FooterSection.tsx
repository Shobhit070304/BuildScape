import Link from "next/link";
import { Layers } from "lucide-react";

export function FooterSection() {
  return (
    <footer className="border-t border-[#1a1a1a] py-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 sm:px-8 lg:px-12">
        <div className="flex items-center gap-2.5">
          <Layers className="h-4 w-4 text-[#5a5450]" />
          <span className="font-serif text-sm font-semibold text-[#7a7168]">
            BuildScape
          </span>
        </div>
        <div className="flex gap-8">
          {["Projects", "How it works", "FAQ"].map((item) => (
            <Link
              key={item}
              href={item === "Projects" ? "/projects" : `#${item.toLowerCase().replace(/ /g, "-")}`}
              className="text-xs text-[#7a7168] transition-colors hover:text-[#c8c0b4]"
            >
              {item}
            </Link>
          ))}
        </div>
        <span className="text-xs text-[#4a4540]">
          Built for developers who learn by doing
        </span>
      </div>
    </footer>
  );
}
