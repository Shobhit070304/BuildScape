export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, "")}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`;
  }
  return "https://buildscape.vercel.app";
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export const SITE_CONFIG = {
  name: "BuildScape",
  title: "BuildScape — Build Real Production Software",
  tagline: "Escape tutorial hell. Build production software through structured, phase-by-phase roadmaps with full code guidance.",
  description:
    "Build real-world distributed architectures, cache engines, streaming databases, and full-stack systems with phase-by-phase blueprints and saved progress.",
  keywords: [
    "system design projects",
    "learn backend engineering",
    "distributed systems tutorial",
    "coding blueprints",
    "build real software",
    "escape tutorial hell",
    "hands on software engineering",
    "learn go by building",
    "learn rust by building",
    "spring boot architecture",
  ],
  links: {
    github: "https://github.com/Shobhit070304/buildscape",
  },
};
