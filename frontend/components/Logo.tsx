import Link from "next/link";
import Image from "next/image";

export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const isSm = size === "sm";

  return (
    <Link href="/" className="group inline-flex items-center gap-2 select-none">
      <Image
        src="/icon.svg"
        alt="BuildScape logo"
        width={isSm ? 24 : 28}
        height={isSm ? 24 : 28}
        className="rounded-lg transition-transform group-hover:scale-105"
        priority
      />
      <span
        className={`font-serif font-bold tracking-tight text-text transition-colors group-hover:text-white ${
          isSm ? "text-sm" : "text-[1.0625rem]"
        }`}
      >
        Build
        <span className="italic font-normal text-accent ml-0.5 transition-colors group-hover:text-accent-hover">
          Scape
        </span>
      </span>
    </Link>
  );
}
