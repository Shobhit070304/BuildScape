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

export const SITE_CONFIG = {
  name: "BuildScape",
  title: "BuildScape — Build Real Production Software",
  tagline: "Escape tutorial hell. Build production software through structured, phase-by-phase roadmaps with full code guidance.",
  description:
    "Build real-world distributed architectures, cache engines, streaming databases, and full-stack systems. Master engineering by doing with phase-by-phase blueprints and verifiable proof-of-work.",
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
    "developer portfolio proof of work",
  ],
  links: {
    github: "https://github.com/Shobhit070304/buildscape",
  },
};
