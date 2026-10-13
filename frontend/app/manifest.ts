import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BuildScape — Build Real Production Software",
    short_name: "BuildScape",
    description:
      "Escape tutorial hell. Build production software through structured, phase-by-phase roadmaps with full code guidance.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
