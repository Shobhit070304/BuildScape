import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { getSiteUrl, serializeJsonLd, SITE_CONFIG } from "@/lib/site";

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

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BuildScape — Build Real Production Software",
    template: "%s | BuildScape",
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: "BuildScape Team" }],
  creator: "BuildScape",
  publisher: "BuildScape",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "BuildScape — Build Real Production Software",
    description: SITE_CONFIG.description,
    siteName: "BuildScape",
    images: [
      {
        url: "/icon.svg",
        width: 1200,
        height: 630,
        alt: "BuildScape — Build Real Production Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BuildScape — Build Real Production Software",
    description: SITE_CONFIG.description,
    creator: "@buildscape",
    images: ["/icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icon.svg" }],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const rootJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "BuildScape",
        description: SITE_CONFIG.description,
        inLanguage: "en-US",
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "BuildScape",
        url: siteUrl,
        logo: `${siteUrl}/icon.svg`,
        sameAs: [SITE_CONFIG.links.github],
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(()=>{try{const s=localStorage.getItem('buildscape-theme');const t=s==='light'||s==='dark'?s:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.dataset.theme=t}catch{document.documentElement.dataset.theme='dark'}})()` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(rootJsonLd) }}
        />
      </head>
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
