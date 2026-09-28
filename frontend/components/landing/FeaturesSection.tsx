import { Code2, Terminal, CheckCircle2, GitBranch, Globe, Database } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-[#222222] bg-[#0e0e0e] p-6 transition-all duration-200 hover:border-[#383838] hover:bg-[#121212] hover:shadow-lg">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-amber-700/40 bg-amber-950/30 shadow-sm">
        {icon}
      </div>
      <h3 className="mb-2 font-serif text-base font-semibold text-[#e4ddd3]">
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
      icon: <Code2 className="h-4.5 w-4.5 text-[#c9a96e]" />,
      title: "Concepts before code",
      description:
        "Every phase starts with a clear explanation of why, not just how. You understand the mental model before you write a single line.",
    },
    {
      icon: <Terminal className="h-4.5 w-4.5 text-[#c9a96e]" />,
      title: "Every command included",
      description:
        "No more guessing what to run. Every npm install, mkdir, and config change is spelled out with the exact command to copy.",
    },
    {
      icon: <CheckCircle2 className="h-4.5 w-4.5 text-[#c9a96e]" />,
      title: "Phase checkpoints",
      description:
        "Each phase ends with a checklist. Did your server start? Does the route work? Verify your understanding before moving on.",
    },
    {
      icon: <GitBranch className="h-4.5 w-4.5 text-[#c9a96e]" />,
      title: "Production architecture",
      description:
        "You're not building a tutorial app. Projects follow real architecture patterns — layered services, typed schemas, error handling.",
    },
    {
      icon: <Globe className="h-4.5 w-4.5 text-[#c9a96e]" />,
      title: "Always ends with deployment",
      description:
        "Every project ships. You end up with a live URL, a GitHub repo, and a project you can actually add to your portfolio.",
    },
    {
      icon: <Database className="h-4.5 w-4.5 text-[#c9a96e]" />,
      title: "Offline progress tracking",
      description:
        "Your completion is saved locally. No login required. Close the tab, come back next week — your progress is right where you left it.",
    },
  ];

  return (
    <section className="border-t border-[#1a1a1a] py-16">
      <div className="mb-10">
        <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-widest text-[#7a7168]">
          What makes it different
        </p>
        <h2 className="font-serif text-2xl font-bold text-[#e4ddd3] sm:text-3xl">
          Built for people who learn by doing
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}
