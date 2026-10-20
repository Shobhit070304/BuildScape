import { Layers } from "lucide-react";
import type { CSSProperties } from "react";

const technologies = [
  { name: "TypeScript", brand: "#3178c6", mark: "ts" },
  { name: "React", brand: "#61dafb", mark: "react" },
  { name: "Node.js", brand: "#5fa04e", mark: "node" },
  { name: "PostgreSQL", brand: "#4169e1", mark: "postgres" },
  { name: "Redis", brand: "#d82c20", mark: "redis" },
  { name: "Docker", brand: "#2496ed", mark: "docker" },
  { name: "Go", brand: "#00add8", mark: "go" },
  { name: "Python", brand: "#3776ab", mark: "python" },
  { name: "System Design", brand: "#c9a96e", mark: "layers" },
];

function TechMark({ mark }: { mark: string }) {
  if (mark === "layers") return <Layers className="landing-marquee-mark" aria-hidden="true" />;

  return (
    <svg className={`landing-marquee-mark landing-marquee-mark-${mark}`} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {mark === "ts" && <><rect x="2" y="2" width="28" height="28" rx="5" fill="currentColor" /><path d="M7 12h11v3h-4v11h-3V15H7v-3Zm13 3.2c.8-2.1 2.5-3.4 5.1-3.4 2.1 0 3.8.8 4.9 2.1l-2.2 2c-.7-.8-1.5-1.2-2.6-1.2-1 0-1.7.4-1.7 1.1 0 .8.8 1.1 2.5 1.6 2.8.8 4.3 1.8 4.3 4.3 0 2.6-2 4.3-5.2 4.3-2.5 0-4.5-.9-5.8-2.6l2.3-1.9c.9 1 2 1.6 3.4 1.6 1.2 0 1.9-.5 1.9-1.3 0-.8-.6-1.2-2.5-1.7-2.8-.8-4.4-1.8-4.4-4.2v-.7Z" fill="var(--mark-foreground, #fff)" transform="translate(-2 -1) scale(.92)" /></>}
      {mark === "react" && <><ellipse cx="16" cy="16" rx="13" ry="5" stroke="currentColor" strokeWidth="1.8" /><ellipse cx="16" cy="16" rx="13" ry="5" stroke="currentColor" strokeWidth="1.8" transform="rotate(60 16 16)" /><ellipse cx="16" cy="16" rx="13" ry="5" stroke="currentColor" strokeWidth="1.8" transform="rotate(120 16 16)" /><circle cx="16" cy="16" r="2.6" fill="currentColor" /></>}
      {mark === "node" && <><path d="m16 2.7 12 6.9v12.8l-12 6.9-12-6.9V9.6l12-6.9Z" stroke="currentColor" strokeWidth="1.8" /><path d="M10 13h12v2.6h-4.4v9h-3.1v-9H10V13Zm10.2 5.1c.4-1.7 1.8-2.7 4-2.7 1.6 0 2.9.5 3.8 1.4l-1.7 1.6c-.6-.5-1.2-.8-2.1-.8-.7 0-1.1.2-1.1.6 0 .5.5.7 1.9 1.1 2.2.6 3.4 1.4 3.4 3.3 0 2-1.6 3.4-4.2 3.4-2 0-3.6-.7-4.7-2l1.8-1.5c.7.8 1.6 1.2 2.7 1.2.9 0 1.4-.3 1.4-.8 0-.5-.5-.7-1.9-1.1-2.2-.6-3.4-1.4-3.4-3.2v-.5Z" fill="currentColor" transform="translate(-3 -2) scale(.86)" /></>}
      {mark === "postgres" && <><path d="M9 9c1.7-3.1 5.1-4.7 9.3-4.2 4.5.5 7.1 3.5 7.3 7.9.1 2.1-.4 4.3-1.2 6.1l.2 4.1c.1 1.7-1 2.9-2.6 2.9-1.4 0-2.2-.9-2.2-2.2v-2.4c-1.2.5-2.5.7-4 .6-2.2-.1-3.9-.9-5.3-2.1l-2.1.5-1.6 2.6c-.6 1-1.8 1.3-2.8.7-.9-.6-1.1-1.7-.5-2.7l2-3.2-.7-3.6C4.2 12.8 5.7 10 9 9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="17.5" cy="11.2" r="1" fill="currentColor" /><path d="M25 13.2c2 .1 3.4-.7 4.2-2.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>}
      {mark === "redis" && <><path d="m16 3 13 6.5-13 6.4L3 9.5 16 3Z" fill="currentColor" /><path d="m3 14.7 13 6.4 13-6.4v3.8L16 25l-13-6.5v-3.8Z" fill="currentColor" opacity=".8" /><path d="m3 21.3 13 6.4 13-6.4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></>}
      {mark === "docker" && <><path d="M3 18.5h20.7c-.6 4.4-4.2 7.4-9.2 7.4H9c-3.1 0-5.2-2.5-6-7.4Z" fill="currentColor" /><path d="M7 14h3v3H7zm4 0h3v3h-3zm4 0h3v3h-3zm-8-4h3v3H7zm4 0h3v3h-3zm4 0h3v3h-3zm-4-4h3v3h-3z" fill="currentColor" /><path d="M24 15.2c1.6-1.7 3.7-1.7 5.3-.3-.8 1.8-2.4 2.7-4.6 2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></>}
      {mark === "go" && <><path d="M4 17.2c0-5.5 4.4-9.9 10.4-9.9 3.2 0 5.7 1.1 7.3 3.1l-3.2 2.8c-.9-1.1-2.2-1.7-4-1.7-3 0-5.1 2.3-5.1 5.5 0 3.1 2 5.2 5.1 5.2 1.2 0 2.2-.2 3.1-.7v-2.3h-4v-3.6h8.7v8.1c-2.2 1.7-4.8 2.6-8.1 2.6C8.1 26.3 4 22.4 4 17.2Z" fill="currentColor" /><circle cx="25" cy="11" r="1.4" fill="currentColor" /><circle cx="29" cy="11" r="1.4" fill="currentColor" /></>}
      {mark === "python" && <><path d="M15.8 3.2c-6 0-5.7 2.6-5.7 2.6v3.1h5.8v1H7.8c-3.3 0-5.1 2-5.1 5.8s1.7 5.7 4.8 5.7h2.4v-3.4c0-2.1 1.8-4 4-4h6.6c1.8 0 3.2-1.5 3.2-3.3V7.2c0-2.8-2.4-4-7.9-4Zm-3.2 3.1a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0Z" fill="currentColor" /><path d="M16.2 28.8c6 0 5.7-2.6 5.7-2.6v-3.1h-5.8v-1h8.1c3.3 0 5.1-2 5.1-5.8s-1.7-5.7-4.8-5.7h-2.4V14c0 2.1-1.8 4-4 4h-6.6c-1.8 0-3.2 1.5-3.2 3.3v3.5c0 2.8 2.4 4 7.9 4Zm3.2-3.1a1.1 1.1 0 1 1 2.2 0 1.1 1.1 0 0 1-2.2 0Z" fill="currentColor" /></>}
    </svg>
  );
}

export function TechMarquee() {
  return (
    <div className="landing-marquee" aria-hidden="true">
      <div className="landing-marquee-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="landing-marquee-group">
            {technologies.map((technology) => (
              <div
                key={`${copy}-${technology.name}`}
                className="landing-marquee-item"
                style={{ "--brand-color": technology.brand } as CSSProperties}
              >
                <span className="landing-marquee-icon"><TechMark mark={technology.mark} /></span>
                <span>{technology.name}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
