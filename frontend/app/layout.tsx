import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BuildScape — Build Real Software",
    template: "%s | BuildScape",
  },
  description:
    "Escape tutorial hell. Build production software through structured, phase-by-phase roadmaps with full code guidance.",
  keywords: [
    "learn to code",
    "project-based learning",
    "developer roadmap",
    "coding projects",
    "software engineering",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-bg text-stone-100 font-sans antialiased selection:bg-amber-900/50 selection:text-amber-200">
        {/* Subtle film grain */}
        <div
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.015] bg-grain"
          aria-hidden="true"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
