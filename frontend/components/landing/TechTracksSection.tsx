import { Package, Database, Code2, Terminal, Layers, Globe } from "lucide-react";

interface TrackPillProps {
  icon: React.ReactNode;
  name: string;
  count: string;
  badgeClass: string;
}

function TrackPill({ icon, name, count, badgeClass }: TrackPillProps) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg border p-2.5 px-4 transition-colors ${badgeClass}`}
    >
      <div>{icon}</div>
      <div>
        <div className="text-[0.8125rem] font-semibold text-[#e4ddd3]">{name}</div>
        <div className="text-[0.7rem] text-[#7a7168]">{count}</div>
      </div>
    </div>
  );
}

export function TechTracksSection() {
  const tracks = [
    {
      icon: <Package className="h-4 w-4 text-sky-300" />,
      name: "Next.js",
      count: "1 project · Beginner",
      badgeClass: "border-sky-800/30 bg-sky-950/20 text-sky-300",
    },
    {
      icon: <Database className="h-4 w-4 text-green-300" />,
      name: "Node.js + PostgreSQL",
      count: "1 project · Intermediate",
      badgeClass: "border-green-800/30 bg-green-950/20 text-green-300",
    },
    {
      icon: <Code2 className="h-4 w-4 text-cyan-300" />,
      name: "React",
      count: "Coming soon",
      badgeClass: "border-cyan-800/30 bg-cyan-950/20 text-cyan-300",
    },
    {
      icon: <Terminal className="h-4 w-4 text-teal-300" />,
      name: "Go",
      count: "Coming soon",
      badgeClass: "border-teal-800/30 bg-teal-950/20 text-teal-300",
    },
    {
      icon: <Layers className="h-4 w-4 text-amber-300" />,
      name: "Python",
      count: "Coming soon",
      badgeClass: "border-amber-800/30 bg-amber-950/20 text-amber-300",
    },
    {
      icon: <Globe className="h-4 w-4 text-purple-300" />,
      name: "DevOps / Docker",
      count: "Coming soon",
      badgeClass: "border-purple-800/30 bg-purple-950/20 text-purple-300",
    },
  ];

  return (
    <section className="border-t border-[#171717] py-16">
      <div className="mb-8">
        <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-widest text-[#7a7168]">
          Learning tracks
        </p>
        <h2 className="font-serif text-2xl font-bold text-[#e4ddd3] sm:text-3xl">
          What can you build?
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {tracks.map((track) => (
          <TrackPill key={track.name} {...track} />
        ))}
      </div>
    </section>
  );
}
