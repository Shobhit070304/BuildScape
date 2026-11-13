"use client";

import React from "react";

export interface TechBadgeProps {
  name: string;
  size?: "xs" | "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

// Crisp, authentic inline SVG tech brand icons
function ReactIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 115.3 100" fill="currentColor">
      <path
        d="M57.65 65.25c11.95 0 21.64-6.83 21.64-15.25s-9.69-15.25-21.64-15.25S36 41.58 36 50s9.69 15.25 21.65 15.25z"
        fill="#61DAFB"
      />
      <ellipse
        cx="57.65"
        cy="50"
        rx="54.27"
        ry="20.87"
        fill="none"
        stroke="#61DAFB"
        strokeWidth="4.2"
      />
      <ellipse
        cx="57.65"
        cy="50"
        rx="54.27"
        ry="20.87"
        transform="rotate(60 57.65 50)"
        fill="none"
        stroke="#61DAFB"
        strokeWidth="4.2"
      />
      <ellipse
        cx="57.65"
        cy="50"
        rx="54.27"
        ry="20.87"
        transform="rotate(120 57.65 50)"
        fill="none"
        stroke="#61DAFB"
        strokeWidth="4.2"
      />
    </svg>
  );
}

function NextjsIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 180 180" fill="none">
      <mask id="mask0_next" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180" style={{ maskType: "alpha" }}>
        <circle cx="90" cy="90" r="90" fill="black" />
      </mask>
      <g mask="url(#mask0_next)">
        <circle cx="90" cy="90" r="90" fill="#000000" />
        <path
          d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
          fill="url(#paint0_linear_next)"
        />
        <rect x="115" y="54" width="12" height="72" fill="url(#paint1_linear_next)" />
      </g>
      <defs>
        <linearGradient id="paint0_linear_next" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="paint1_linear_next" x1="121" y1="54" x2="120.799" y2="106.875" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function TypeScriptIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128 128">
      <rect width="128" height="128" rx="20" fill="#3178C6" />
      <path
        d="M72.5 86.8c1.8 1.4 4 2.2 6.5 2.2 4.1 0 6.6-2 6.6-5.4 0-3.9-3.2-5.3-7.5-7.1l-2.6-1.1c-6.8-2.8-11.4-6.8-11.4-14.7 0-9.6 7.4-16.1 18.5-16.1 5.9 0 10.9 1.6 14.5 4.5l-4.5 7.8c-2.8-2-6.5-3.5-10.2-3.5-4.4 0-6.9 2-6.9 5 0 3.3 2.6 4.7 6.8 6.5l2.6 1.1c8.1 3.5 12.4 7.6 12.4 15.6 0 10.4-8 16.9-19.9 16.9-7.2 0-13.6-2.2-18-5.8l3.1-10.4zM32.5 54h14.5v56.4h11.6V54h14.5V45H32.5v9z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

function PythonIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 110 110" fill="none">
      <path
        d="M54.4 7C34.7 7 36 15.5 36 15.5l.02 8.8h18.8v2.6H23.5S10 25.3 10 45.2c0 19.8 11.8 19.1 11.8 19.1h7v-9.5s-.4-11.4 11.2-11.4h18.5s10.8.2 10.8-10.4V22.6S71 7 54.4 7zM43.7 15.1c2.4 0 4.3 1.9 4.3 4.3 0 2.4-1.9 4.3-4.3 4.3-2.4 0-4.3-1.9-4.3-4.3 0-2.4 1.9-4.3 4.3-4.3z"
        fill="#3776AB"
      />
      <path
        d="M55.6 103c19.7 0 18.4-8.5 18.4-8.5l-.02-8.8H55.2v-2.6h31.3s13.5 1.6 13.5-18.3c0-19.8-11.8-19.1-11.8-19.1h-7v9.5s.4 11.4-11.2 11.4H51.5s-10.8-.2-10.8 10.4v10.4s-1.7 15.6 14.9 15.6zm10.7-8.1c-2.4 0-4.3-1.9-4.3-4.3 0-2.4 1.9-4.3 4.3-4.3 2.4 0 4.3 1.9 4.3 4.3 0 2.4-1.9 4.3-4.3 4.3z"
        fill="#FFD43B"
      />
    </svg>
  );
}

function GoIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#00ADD8">
      <path d="M1.811 10.231c.047-.197.106-.39.183-.578.502-1.228 1.554-2.039 2.879-2.223 1.642-.228 3.037.587 3.655 2.115.151.374.223.774.28 1.171h-1.396c-.056-.474-.204-.897-.502-1.264-.544-.668-1.269-.871-2.09-.597-.847.283-1.328.932-1.427 1.819-.138 1.233.518 2.302 1.704 2.502.812.136 1.528-.095 2.06-.723.235-.278.368-.616.425-.978H5.066v-1.125h3.693v.281c-.021.758-.17 1.487-.535 2.158-.696 1.278-1.782 2.015-3.217 2.117-1.442.102-2.697-.487-3.468-1.713-.391-.623-.585-1.325-.668-2.046l-.06-.84-.0001-.049zM15.422 10.751c-.015 1.564-.672 2.802-1.942 3.626-1.12.727-2.394.887-3.691.503-1.32-.392-2.215-1.298-2.64-2.613-.424-1.314-.247-2.612.518-3.766.784-1.182 1.884-1.874 3.284-2.031 1.488-.168 2.759.349 3.692 1.517.519.651.802 1.411.839 2.247l-.06.517zm-1.419-.344c-.035-.745-.258-1.393-.728-1.923-.625-.705-1.425-.939-2.316-.726-.957.228-1.58.859-1.841 1.789-.317 1.13.067 2.259 1.011 2.871.745.483 1.579.522 2.395.143.916-.426 1.441-1.173 1.479-2.154z" />
    </svg>
  );
}

function RustIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 106 106" fill="currentColor">
      <path
        d="M53 10.5a42.5 42.5 0 0 0-42.5 42.5c0 14.5 7.2 27.2 18.2 35l1.6-4.5c-9.2-6.6-15.3-17.3-15.3-29.5a38 38 0 1 1 76 0c0 12.2-6.1 22.9-15.3 29.5l1.6 4.5a42.4 42.4 0 0 0 18.2-35A42.5 42.5 0 0 0 53 10.5z"
        fill="#DEA584"
      />
      <path
        d="M48.5 35h9.2c7.2 0 12 3.8 12 10 0 4.5-2.5 7.8-6.8 9.2l8.8 16.8h-7.6l-7.7-15.5h-3.4V71h-6.5V35zm6.5 15h2.4c3.8 0 5.8-1.8 5.8-4.8 0-3.1-2-4.7-5.8-4.7H55V50z"
        fill="#F74C00"
      />
    </svg>
  );
}

function DockerIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#2496ED">
      <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.186.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.186.186.186m5.893 2.715h2.118a.186.186 0 00.186-.186V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.186v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H5.136a.186.186 0 00-.186.186v1.888c0 .102.084.185.186.185m-2.928 0h2.12a.185.185 0 00.185-.185V9.006a.186.186 0 00-.186-.186h-2.12a.186.186 0 00-.185.186v1.888c0 .102.083.185.185.185M23.77 10.97c-.287-.204-.97-.378-1.895-.246-.35-.744-.925-1.37-1.688-1.78l-.348-.19-.247.31c-.347.433-.568.96-.645 1.512-.472.06-1.58.26-2.296.883H1.054c-.16 0-.304.095-.373.242-.486 1.042-.716 2.378-.716 3.863 0 1.25.176 2.383.526 3.376 1.066 3.018 3.535 5.08 7.34 6.13 1.488.41 3.12.62 4.857.62 1.417 0 2.825-.143 4.186-.425 3.33-.69 5.864-2.316 7.534-4.834.18-.27.34-.552.484-.842.695-.145 1.705-.506 2.22-1.37.195-.327.276-.714.238-1.123a2.386 2.386 0 00-.58-1.226z" />
    </svg>
  );
}

function PostgresIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#4169E1">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  );
}

function SpringBootIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#6DB33F">
      <path d="M21.99 12.01c0 4.18-2.58 7.76-6.24 9.22l-1.46-3.86a6.002 6.002 0 003.7-5.36c0-2.82-1.94-5.18-4.57-5.83l1.45-3.85c4.15 1.05 7.12 4.97 7.12 9.68zM2.01 12.01c0-4.71 2.97-8.63 7.12-9.68l1.45 3.85C7.95 6.83 6.01 9.19 6.01 12c0 2.45 1.47 4.56 3.57 5.5l-1.45 3.86C4.52 19.86 2.01 16.24 2.01 12.01z" />
      <circle cx="12" cy="12" r="3" fill="#6DB33F" />
    </svg>
  );
}

function TailwindIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#06B6D4">
      <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
    </svg>
  );
}

function RedisIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#DC382D">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#DC382D" strokeWidth="2" fill="none" />
    </svg>
  );
}

function FastApiIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#009688">
      <path d="M12 2L3 14h7v8l9-12h-7z" />
    </svg>
  );
}

function DefaultCodeIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

// Map tech names to their real brand SVGs and styles
const BRAND_MAP: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    pillClass: string;
  }
> = {
  // Frontend
  React: { icon: ReactIcon, pillClass: "border-sky-500/30 bg-sky-950/30 text-sky-200" },
  "React 19": { icon: ReactIcon, pillClass: "border-sky-500/30 bg-sky-950/30 text-sky-200" },
  "Next.js": { icon: NextjsIcon, pillClass: "border-slate-700 bg-slate-900/60 text-slate-200" },
  "Next.js & TypeScript": { icon: NextjsIcon, pillClass: "border-sky-500/30 bg-sky-950/30 text-sky-200" },
  TypeScript: { icon: TypeScriptIcon, pillClass: "border-blue-500/30 bg-blue-950/30 text-blue-200" },
  "Tailwind CSS": { icon: TailwindIcon, pillClass: "border-cyan-500/30 bg-cyan-950/30 text-cyan-200" },
  "Tailwind v4": { icon: TailwindIcon, pillClass: "border-cyan-500/30 bg-cyan-950/30 text-cyan-200" },

  // Backend & Systems
  Go: { icon: GoIcon, pillClass: "border-cyan-500/30 bg-cyan-950/30 text-cyan-200" },
  Golang: { icon: GoIcon, pillClass: "border-cyan-500/30 bg-cyan-950/30 text-cyan-200" },
  Python: { icon: PythonIcon, pillClass: "border-amber-500/30 bg-amber-950/30 text-amber-200" },
  "Python & FastAPI": { icon: PythonIcon, pillClass: "border-teal-500/30 bg-teal-950/30 text-teal-200" },
  FastAPI: { icon: FastApiIcon, pillClass: "border-teal-500/30 bg-teal-950/30 text-teal-200" },
  Rust: { icon: RustIcon, pillClass: "border-orange-500/30 bg-orange-950/30 text-orange-200" },
  "Spring Boot": { icon: SpringBootIcon, pillClass: "border-emerald-500/30 bg-emerald-950/30 text-emerald-200" },
  "Spring Boot 3.5": { icon: SpringBootIcon, pillClass: "border-emerald-500/30 bg-emerald-950/30 text-emerald-200" },
  "Full-Stack SpringBoot": { icon: SpringBootIcon, pillClass: "border-emerald-500/30 bg-emerald-950/30 text-emerald-200" },
  "Node.js": { icon: DefaultCodeIcon, pillClass: "border-emerald-500/30 bg-emerald-950/30 text-emerald-200" },

  // Infrastructure & Data
  Docker: { icon: DockerIcon, pillClass: "border-blue-500/30 bg-blue-950/30 text-blue-200" },
  PostgreSQL: { icon: PostgresIcon, pillClass: "border-indigo-500/30 bg-indigo-950/30 text-indigo-200" },
  pgx: { icon: PostgresIcon, pillClass: "border-indigo-500/30 bg-indigo-950/30 text-indigo-200" },
  Redis: { icon: RedisIcon, pillClass: "border-rose-500/30 bg-rose-950/30 text-rose-200" },
};

export function TechBadge({
  name,
  size = "xs",
  showIcon = true,
  className = "",
}: TechBadgeProps) {
  const brand = BRAND_MAP[name];
  const IconComponent = brand ? brand.icon : DefaultCodeIcon;

  const sizeClasses = {
    xs: "px-2 py-0.5 text-[0.68rem] gap-1.5",
    sm: "px-2.5 py-0.5 text-xs gap-1.5",
    md: "px-3 py-1 text-xs gap-2 font-medium",
  }[size];

  const iconSizes = {
    xs: "h-3.5 w-3.5",
    sm: "h-4 w-4",
    md: "h-4 w-4",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border border-white/[0.08] bg-white/[0.04] text-neutral-300 font-mono transition-all hover:border-white/20 hover:text-white shadow-xs ${sizeClasses} ${className}`}
    >
      {showIcon && <IconComponent className={`shrink-0 ${iconSizes}`} />}
      <span>{name}</span>
    </span>
  );
}
