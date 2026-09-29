import {
  Code2,
  Terminal,
  CheckCircle2,
  GitBranch,
  Globe,
  Cloud,
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group rounded-2xl border border-[#24211b] bg-[#0e0d0b] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#38332a] hover:bg-[#12100d] hover:shadow-xl">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-amber-800/40 bg-amber-950/30 text-[#c9a96e] shadow-sm transition-colors group-hover:border-amber-600/50 group-hover:bg-amber-900/30 group-hover:text-amber-300">
        {icon}
      </div>
      <h3 className="mb-2 font-serif text-lg font-bold text-[#e4ddd3] transition-colors group-hover:text-[#d4b577]">
        {title}
      </h3>
      <p className="text-xs leading-relaxed text-[#8a8178]">
        {description}
      </p>
    </div>
  );
}

export function FeaturesSection() {
  const features = [
    {
      icon: <Code2 className="h-5 w-5" />,
      title: "Concepts before code",
      description:
        "Every phase starts with a clear mental model and architectural diagram. You understand the 'why' before writing a single line of syntax.",
    },
    {
      icon: <Terminal className="h-5 w-5" />,
      title: "Every command included",
      description:
        "No more guesswork or broken tutorials. Every package installation, directory command, and configuration step is explicitly detailed.",
    },
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      title: "Phase verification checkpoints",
      description:
        "Each phase concludes with a strict checkpoint checklist. Verify that your routes, database models, and components run cleanly before moving on.",
    },
    {
      icon: <GitBranch className="h-5 w-5" />,
      title: "Real SaaS architecture",
      description:
        "Build layered codebases that mimic production tech companies: typed schemas, structured services, robust error handling, and clean boundaries.",
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: "Always ends with deployment",
      description:
        "Every project ships live to Vercel or Render with custom domains, production environment configs, and GitHub portfolio repositories.",
    },
    {
      icon: <Cloud className="h-5 w-5" />,
      title: "Cloud sync & guest mode",
      description:
        "Sign in with Google to sync your completed phases and enrollments across all devices, or build immediately as a guest with instant local storage saving.",
    },
  ];

  return (
    <section className="mb-24">
      <div className="mb-10 text-center">
        <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wider text-[#7a7168]">
          The BuildScape Standard
        </p>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-[#f0eae1] sm:text-4xl">
          Engineered for developers who learn by building
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}
