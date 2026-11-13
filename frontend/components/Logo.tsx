import Link from "next/link";
import Image from "next/image";

export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const isSm = size === "sm";

  return (
    <Link href="/" className="group inline-flex items-center gap-2.5 select-none">
      <div className="relative flex items-center justify-center">
        <div className="absolute -inset-1 rounded-xl bg-white/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
        <Image
          src="/icon.svg"
          alt="BuildScape logo"
          width={isSm ? 24 : 28}
          height={isSm ? 24 : 28}
          className="relative rounded-lg shadow-sm transition-transform duration-200 group-hover:scale-105"
          priority
        />
      </div>
      <span
        className={`font-sans font-extrabold tracking-tight text-white transition-colors ${
          isSm ? "text-sm" : "text-[1.0625rem]"
        }`}
      >
        Build
        <span className="font-medium text-neutral-400 ml-0.5 transition-colors group-hover:text-white">
          Scape
        </span>
      </span>
    </Link>
  );
}
