import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BuildScape — Learn by Building",
    template: "%s | BuildScape",
  },
  description:
    "Escape tutorial hell. Build real projects through structured, phase-by-phase roadmaps with full code guidance.",
  keywords: [
    "learn to code",
    "project-based learning",
    "developer roadmap",
    "coding projects",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-neutral-950 text-stone-100 font-sans antialiased selection:bg-amber-900/50 selection:text-amber-200">
        {/* Grain overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.035] bg-grain"
          aria-hidden="true"
        />
        {children}
      </body>
    </html>
  );
}
