import Link from "next/link";
import { ArrowRight, Layers, Sparkles, MoveUpRight } from "lucide-react";
import type { Project } from "@/lib/projects";

export function FeaturedProjectsSection({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="relative mx-auto mb-24 max-w-6xl scroll-mt-24 text-center sm:mb-32">
      <div className="mx-auto mb-10 max-w-2xl">
        <span className="pill-amber"><Sparkles className="h-3 w-3" />Choose your next build</span>
        <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-text sm:text-4xl">A working project is the outcome.</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-text-muted">Explore practical blueprints across modern stacks, from the first setup command to a finished, verifiable system.</p>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 text-left md:grid-cols-2">
        {projects.slice(0, 2).map((project) => (
          <article key={project.slug} className="project-preview group relative overflow-hidden rounded-xl border border-border bg-surface-card p-4 shadow-sm transition duration-300 sm:p-5">
            <div className="pointer-events-none absolute -right-10 -top-16 h-36 w-36 rounded-full bg-[radial-gradient(circle,#c9a96e,transparent_70%)] opacity-[0.08] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.16]" />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent"><span className="h-1.5 w-1.5 rounded-full bg-accent" />{project.track}</span>
                <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-text-muted">{project.difficulty}</span>
              </div>
              <h3 className="max-w-sm font-sans text-xl font-extrabold leading-tight tracking-tight text-text sm:text-2xl">{project.title}</h3>
              <p className="mt-2 min-h-10 max-w-md text-xs leading-relaxed text-text-muted">{project.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.techStack.slice(0, 4).map((tag) => <span key={tag} className="rounded-md border border-border-subtle bg-surface px-2 py-0.5 font-mono text-[9px] text-text-muted">{tag}</span>)}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 font-mono text-[9px] text-text-muted">
                <span className="inline-flex items-center gap-2"><Layers className="h-3.5 w-3.5 text-accent" />{project.phases.length} phases <span className="text-text-faint">/</span> ~{project.estimatedHours} hours</span>
                <MoveUpRight className="h-4 w-4 text-text-faint" aria-hidden="true" />
              </div>
            </div>
          </article>
        ))}
      </div>
      <Link href="/projects" className="btn-primary mt-7">
        Browse all projects <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
