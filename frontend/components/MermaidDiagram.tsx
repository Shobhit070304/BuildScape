"use client";

import { useEffect, useId, useState } from "react";
import { Copy, Check, Code2, Network, Loader2 } from "lucide-react";

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const [svgHtml, setSvgHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const rawId = useId();
  const diagramId = `mermaid-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    let cancelled = false;

    async function renderChart() {
      setLoading(true);
      setError(null);

      try {
        // Check if mermaid is already available on window
        const win = window as unknown as { mermaid?: { initialize: (opts: unknown) => void; render: (id: string, text: string) => Promise<{ svg: string }> } };
        let mermaid = win.mermaid;

        if (!mermaid) {
          // Dynamic ESM import from trusted CDN
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const mermaidModule = await import(/* webpackIgnore: true */ "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs");
          mermaid = mermaidModule.default || mermaidModule;
          win.mermaid = mermaid;
        }

        if (!mermaid) {
          throw new Error("Mermaid library could not be loaded");
        }

        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            darkMode: true,
            background: "#0A0A0E",
            mainBkg: "#0E0E14",
            nodeBorder: "#FFFFFF",
            clusterBkg: "#07070A",
            clusterBorder: "#27272A",
            titleColor: "#FFFFFF",
            edgeLabelBackground: "#18181B",
            lineColor: "#A1A1AA",
            textColor: "#FFFFFF",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          },
          securityLevel: "loose",
        });

        // Clean up any stray markdown backticks or extra whitespace
        const cleanChart = chart.trim().replace(/^```mermaid\s*/i, "").replace(/```$/, "").trim();

        const { svg } = await mermaid.render(diagramId, cleanChart);
        if (!cancelled) {
          setSvgHtml(svg);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("Mermaid rendering failed:", err);
          setError(err instanceof Error ? err.message : "Failed to render diagram");
          setLoading(false);
        }
      }
    }

    void renderChart();

    return () => {
      cancelled = true;
    };
  }, [chart, diagramId]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(chart.trim());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0A0E] shadow-2xl shadow-black/40">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#07070A] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-white" />
          <span className="font-mono text-xs font-semibold text-neutral-200 uppercase tracking-wider">
            Architecture Diagram
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCode((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
          >
            <Code2 className="h-3 w-3" />
            <span>{showCode ? "View Diagram" : "View Code"}</span>
          </button>

          <button
            type="button"
            onClick={() => void copyCode()}
            aria-label="Copy diagram source"
            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      {showCode ? (
        <pre className="overflow-x-auto p-4 text-xs font-mono text-neutral-300 bg-[#07070A]">
          <code>{chart.trim()}</code>
        </pre>
      ) : loading ? (
        <div className="flex min-h-[160px] items-center justify-center p-8 text-xs text-neutral-400 font-mono gap-2.5">
          <Loader2 className="h-4 w-4 animate-spin text-white" />
          <span>Rendering diagram...</span>
        </div>
      ) : error || !svgHtml ? (
        <div className="p-4">
          <div className="mb-2 text-xs text-amber-300 font-mono">
            Could not render visual diagram. Showing source below:
          </div>
          <pre className="overflow-x-auto p-3 rounded-lg border border-white/10 text-xs font-mono text-neutral-300 bg-[#07070A]">
            <code>{chart.trim()}</code>
          </pre>
        </div>
      ) : (
        <div
          className="overflow-x-auto p-6 flex justify-center items-center [&_svg]:max-w-full [&_svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      )}
    </div>
  );
}
