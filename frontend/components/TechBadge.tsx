"use client";

import React from "react";
import {
  Layers,
  Server,
  Terminal,
  FileCode2,
  Database,
  Zap,
  Box,
  Sparkles,
  Palette,
  Boxes,
  Workflow,
  Network,
  Binary,
  Cpu,
  Globe,
  Code2
} from "lucide-react";

export interface TechBadgeProps {
  name: string;
  size?: "xs" | "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

interface TechStyle {
  text: string;
  bg: string;
  border: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const TECH_STYLES: Record<string, TechStyle> = {
  "Next.js": {
    text: "text-zinc-100",
    bg: "bg-zinc-900/90",
    border: "border-zinc-700 hover:border-zinc-500",
    icon: Layers,
  },
  "Node.js": {
    text: "text-emerald-400",
    bg: "bg-emerald-950/60",
    border: "border-emerald-800/70 hover:border-emerald-600",
    icon: Server,
  },
  Python: {
    text: "text-amber-300",
    bg: "bg-amber-950/50",
    border: "border-amber-800/70 hover:border-amber-600",
    icon: Terminal,
  },
  TypeScript: {
    text: "text-sky-400",
    bg: "bg-sky-950/60",
    border: "border-sky-800/70 hover:border-sky-600",
    icon: FileCode2,
  },
  PostgreSQL: {
    text: "text-cyan-400",
    bg: "bg-cyan-950/60",
    border: "border-cyan-800/70 hover:border-cyan-600",
    icon: Database,
  },
  Redis: {
    text: "text-rose-400",
    bg: "bg-rose-950/60",
    border: "border-rose-800/70 hover:border-rose-600",
    icon: Zap,
  },
  FastAPI: {
    text: "text-teal-400",
    bg: "bg-teal-950/60",
    border: "border-teal-800/70 hover:border-teal-600",
    icon: Cpu,
  },
  Docker: {
    text: "text-blue-400",
    bg: "bg-blue-950/60",
    border: "border-blue-800/70 hover:border-blue-600",
    icon: Box,
  },
  LangChain: {
    text: "text-orange-400",
    bg: "bg-orange-950/60",
    border: "border-orange-800/70 hover:border-orange-600",
    icon: Sparkles,
  },
  "Tailwind CSS": {
    text: "text-cyan-300",
    bg: "bg-cyan-950/50",
    border: "border-cyan-800/60 hover:border-cyan-600",
    icon: Palette,
  },
  Prisma: {
    text: "text-indigo-400",
    bg: "bg-indigo-950/60",
    border: "border-indigo-800/70 hover:border-indigo-600",
    icon: Boxes,
  },
  BullMQ: {
    text: "text-pink-400",
    bg: "bg-pink-950/60",
    border: "border-pink-800/70 hover:border-pink-600",
    icon: Workflow,
  },
  "Tree-sitter": {
    text: "text-lime-400",
    bg: "bg-lime-950/60",
    border: "border-lime-800/70 hover:border-lime-600",
    icon: Network,
  },
  Qdrant: {
    text: "text-red-400",
    bg: "bg-red-950/60",
    border: "border-red-800/70 hover:border-red-600",
    icon: Binary,
  },
  Express: {
    text: "text-neutral-300",
    bg: "bg-neutral-900/80",
    border: "border-neutral-700 hover:border-neutral-500",
    icon: Globe,
  },
  MDX: {
    text: "text-amber-400",
    bg: "bg-amber-950/50",
    border: "border-amber-800/60 hover:border-amber-600",
    icon: Code2,
  },
  default: {
    text: "text-stone-300",
    bg: "bg-stone-900/80",
    border: "border-stone-800 hover:border-stone-700",
    icon: Code2,
  },
};

export function TechBadge({
  name,
  size = "xs",
  showIcon = true,
  className = "",
}: TechBadgeProps) {
  const style = TECH_STYLES[name] ?? TECH_STYLES.default;
  const IconComponent = style.icon;

  const sizeClasses = {
    xs: "px-2 py-0.5 text-[0.68rem] gap-1",
    sm: "px-2.5 py-0.5 text-xs gap-1.5",
    md: "px-3 py-1 text-xs gap-1.5 font-medium",
  }[size];

  const iconSizes = {
    xs: "h-3 w-3",
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium transition-all duration-150 ${style.text} ${style.bg} ${style.border} ${sizeClasses} ${className}`}
    >
      {showIcon && <IconComponent className={`shrink-0 ${iconSizes}`} />}
      <span>{name}</span>
    </span>
  );
}
