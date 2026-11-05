import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";
import { serializeStructuredData } from "@/lib/structuredData";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Curated Engineering Projects & Curriculums",
  description:
    "Explore hands-on production system blueprints across Go, Next.js, Node.js, PostgreSQL, Python, Rust, and Spring Boot. Escape tutorial hell by building real software.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: "Curated Engineering Projects & Curriculums | BuildScape",
    description:
      "Explore hands-on production system blueprints across Go, Next.js, Node.js, PostgreSQL, Python, Rust, and Spring Boot.",
    url: `${siteUrl}/projects`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Curated Engineering Projects & Curriculums | BuildScape",
    description:
      "Explore hands-on production system blueprints across Go, Next.js, Node.js, PostgreSQL, Python, Rust, and Spring Boot.",
  },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "BuildScape Curriculum Library",
    description:
      "Explore hands-on production system blueprints across Go, Next.js, Node.js, PostgreSQL, Python, Rust, and Spring Boot.",
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
        dangerouslySetInnerHTML={{ __html: serializeStructuredData(collectionJsonLd) }}
      />
      {children}
    </>
  );
}
