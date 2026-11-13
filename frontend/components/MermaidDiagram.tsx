"use client";

import { useEffect, useId, useState } from "react";
import {
  Copy,
  Check,
  Code2,
  Network,
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
} from "lucide-react";

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const [svgHtml, setSvgHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
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
            fontSize: "14px",
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

  const handleZoomIn = () => setZoom((z) => Math.min(Number((z + 0.2).toFixed(1)), 2.4));
  const handleZoomOut = () => setZoom((z) => Math.max(Number((z - 0.2).toFixed(1)), 0.6));
  const handleResetZoom = () => setZoom(1);

  return (
    <>
      <div className="my-6 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0A0E] shadow-2xl shadow-black/60">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] bg-[#07070A] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-white" />
            <span className="font-mono text-xs font-semibold text-neutral-200 uppercase tracking-wider">
              Architecture Diagram
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Zoom Controls (only when showing diagram) */}
            {!showCode && svgHtml && (
              <div className="flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] p-0.5 mr-1">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  aria-label="Zoom Out"
                  className="rounded p-1 text-neutral-400 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  title="Reset Zoom"
                  className="px-1.5 font-mono text-[10px] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  aria-label="Zoom In"
                  className="rounded p-1 text-neutral-400 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Expand to Fullscreen Modal Button */}
            {!showCode && svgHtml && (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                title="Expand Fullscreen"
                className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
              >
                <Maximize2 className="h-3 w-3" />
                <span className="hidden sm:inline">Expand</span>
              </button>
            )}

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
          <div className="flex min-h-[220px] items-center justify-center p-8 text-xs text-neutral-400 font-mono gap-2.5">
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            <span>Rendering architecture diagram...</span>
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
          <div className="overflow-x-auto p-6 sm:p-8 min-h-[300px] flex items-center justify-center bg-[#07070A]/50">
            <div
              style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
              className="transition-transform duration-150 [&_svg]:min-w-[600px] sm:[&_svg]:min-w-[760px] [&_svg]:max-w-none [&_svg]:h-auto flex justify-center"
              dangerouslySetInnerHTML={{ __html: svgHtml }}
            />
          </div>
        )}
      </div>

      {/* Expanded Fullscreen Lightbox Modal */}
      {isExpanded && svgHtml && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 p-4 sm:p-6 backdrop-blur-md">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <Network className="h-5 w-5 text-white" />
              <div>
                <h3 className="font-sans text-sm font-bold text-white">Architecture Diagram Full View</h3>
                <p className="text-[11px] text-neutral-400 font-mono">Scroll and pan freely to view details</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] p-1">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  aria-label="Zoom Out"
                  className="rounded p-1 text-neutral-400 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  title="Reset Zoom"
                  className="px-2 font-mono text-xs text-neutral-300 hover:text-white cursor-pointer"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  aria-label="Zoom In"
                  className="rounded p-1 text-neutral-400 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="rounded-lg border border-white/10 bg-white/[0.06] p-2 text-neutral-300 hover:bg-white hover:text-black transition-colors cursor-pointer"
                aria-label="Close full view"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Modal SVG Body */}
          <div className="flex-1 overflow-auto rounded-xl border border-white/10 bg-[#07070A] p-6 sm:p-10 flex items-center justify-center">
            <div
              style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
              className="transition-transform duration-150 [&_svg]:min-w-[800px] sm:[&_svg]:min-w-[1000px] [&_svg]:max-w-none [&_svg]:h-auto flex justify-center"
              dangerouslySetInnerHTML={{ __html: svgHtml }}
            />
          </div>
        </div>
      )}
    </>
  );
}
