import type { Metadata } from "next";
import { fetchProjectBySlugFromDb } from "@/lib/projects";
import { ProjectOverviewView } from "@/components/ProjectOverviewView";
import { getSiteUrl, serializeJsonLd } from "@/lib/site";


interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ access?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = getSiteUrl();

  try {
    const project = await fetchProjectBySlugFromDb(slug);
    if (!project) {
      const formattedTitle = slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      return {
        title: `${formattedTitle} — BuildScape`,
        description: `Hands-on software engineering project blueprint on BuildScape.`,
      };
    }

    const title = `${project.title} — ${project.track} Blueprint`;
    const description = `${project.tagline} Step-by-step ${project.difficulty.toLowerCase()}-level blueprint (${project.estimatedHours}h) with phase architecture and source code guidance.`;

    return {
      title,
      description,
      keywords: [
        ...project.techStack,
        project.track,
        `${project.title} tutorial`,
        "system design project",
        "hands-on architecture blueprint",
        "learn by doing",
      ],
      alternates: {
        canonical: `/projects/${project.slug}`,
      },
      openGraph: {
        title: `${project.title} | BuildScape Blueprint`,
        description,
        url: `${siteUrl}/projects/${project.slug}`,
        type: "article",
        siteName: "BuildScape",
        tags: project.techStack,
      },
      twitter: {
        card: "summary_large_image",
        title: `${project.title} | BuildScape`,
        description,
        creator: "@buildscape",
      },
    };
  } catch {
    return { title: "Project Overview — BuildScape" };
  }
}

export default async function ProjectOverviewPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { access } = await searchParams;
  const siteUrl = getSiteUrl();

  let project = null;
  try {
    project = await fetchProjectBySlugFromDb(slug);
  } catch (err) {
    console.warn(`Could not load project "${slug}" server-side:`, err);
  }

  const courseJsonLd = project
    ? {
        "@context": "https://schema.org",
        "@type": "Course",
        name: project.title,
        description: project.tagline,
        provider: {
          "@type": "Organization",
          name: "BuildScape",
          sameAs: siteUrl,
        },
        educationalLevel: project.difficulty,
        timeRequired: `PT${project.estimatedHours}H`,
        about: project.techStack,
        teaches: project.whatYouWillLearn?.join("; ") || project.tagline,
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "online",
          courseWorkload: `${project.estimatedHours} hours`,
        },
      }
    : null;

  return (
    <>
      {courseJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(courseJsonLd) }}
        />
      )}
      <ProjectOverviewView
        initialProject={project ?? null}
        slug={slug}
        access={access}
      />
    </>
  );
}
