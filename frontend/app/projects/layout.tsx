import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Curated Engineering Projects & Curriculums",
  description:
    "Explore hands-on production system blueprints across Distributed Systems, Go, Rust, Spring Boot, Python, and Machine Learning. Escape tutorial hell by building real software.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: "Curated Engineering Projects & Curriculums | BuildScape",
    description:
      "Explore hands-on production system blueprints across Distributed Systems, Go, Rust, Spring Boot, Python, and Machine Learning.",
    url: `${siteUrl}/projects`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Curated Engineering Projects & Curriculums | BuildScape",
    description:
      "Explore hands-on production system blueprints across Distributed Systems, Go, Rust, Spring Boot, Python, and Machine Learning.",
  },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "BuildScape Curriculum Library",
    description:
      "Explore hands-on production system blueprints across Distributed Systems, Go, Rust, Spring Boot, Python, and Machine Learning.",
    url: `${siteUrl}/projects`,
    isPartOf: {
      "@type": "WebSite",
      name: "BuildScape",
      url: siteUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      {children}
    </>
  );
}
