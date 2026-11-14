"use client";

import { useEffect, useId, useState, useRef, useCallback } from "react";
import {
  Copy,
  Check,
  Code2,
  Network,
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Download,
  FileCode,
  X,
  Move,
} from "lucide-react";

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const [svgHtml, setSvgHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Pan & Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const rawId = useId();
  const diagramId = `mermaid-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderChart() {
      setLoading(true);
      setError(null);

      try {
        const win = window as unknown as {
          mermaid?: {
            initialize: (opts: unknown) => void;
            render: (id: string, text: string) => Promise<{ svg: string }>;
          };
        };
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

  // Keyboard shortcut listener for expanded modal
  useEffect(() => {
    if (!isExpanded) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
      } else if (e.key === "+" || e.key === "=") {
        setZoom((z) => Math.min(Number((z + 0.2).toFixed(2)), 4.0));
      } else if (e.key === "-" || e.key === "_") {
        setZoom((z) => Math.max(Number((z - 0.2).toFixed(2)), 0.25));
      } else if (e.key === "0" || e.key === "r" || e.key === "R") {
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  // Pan Mouse Handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Primary click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Pan Touch Handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  }, [pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Wheel Zoom Handler
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setZoom((prev) => {
      const next = prev * zoomFactor;
      return Math.min(Math.max(Number(next.toFixed(2)), 0.25), 4.0);
    });
  }, []);

  // Reset Zoom & Pan
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleZoomIn = () => setZoom((z) => Math.min(Number((z + 0.25).toFixed(2)), 4.0));
  const handleZoomOut = () => setZoom((z) => Math.max(Number((z - 0.25).toFixed(2)), 0.25));

  // Copy Mermaid Source Code
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(chart.trim());
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 1600);
    } catch {
      setCopiedCode(false);
    }
  };

  // Copy Rendered SVG Markup
  const copySvg = async () => {
    if (!svgHtml) return;
    try {
      await navigator.clipboard.writeText(svgHtml);
      setCopiedSvg(true);
      window.setTimeout(() => setCopiedSvg(false), 1600);
    } catch {
      setCopiedSvg(false);
    }
  };

  // High-Resolution PNG Download
  const downloadPng = () => {
    if (!svgHtml) return;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgHtml, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (!svgEl) return;

      const bboxWidth = parseFloat(svgEl.getAttribute("width") || "1200") || 1200;
      const bboxHeight = parseFloat(svgEl.getAttribute("height") || "800") || 800;

      const scale = 2; // Crisp retina output
      const canvas = document.createElement("canvas");
      canvas.width = (bboxWidth + 80) * scale;
      canvas.height = (bboxHeight + 80) * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Dark background fill
      ctx.fillStyle = "#0A0A0E";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const serialized = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        ctx.drawImage(img, 40 * scale, 40 * scale, bboxWidth * scale, bboxHeight * scale);
        URL.revokeObjectURL(url);
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = "buildscape-architecture-diagram.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      img.src = url;
    } catch (err) {
      console.error("Failed to download diagram as PNG:", err);
    }
  };

  return (
    <>
      <div className="my-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0E] shadow-2xl shadow-black/60 group/diagram">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] bg-[#07070A] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-emerald-400" />
            <span className="font-mono text-xs font-semibold text-neutral-200 uppercase tracking-wider">
              Architecture Blueprint
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Inline Quick Zoom Controls */}
            {!showCode && svgHtml && (
              <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-0.5 mr-1">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out (-)"
                  aria-label="Zoom Out"
                  className="rounded p-1 text-neutral-400 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleResetView}
                  title="Reset Zoom (100%)"
                  className="px-1.5 font-mono text-[10px] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In (+)"
                  aria-label="Zoom In"
                  className="rounded p-1 text-neutral-400 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Expand Fullscreen Button */}
            {!showCode && svgHtml && (
              <button
                type="button"
                onClick={() => {
                  handleResetView();
                  setIsExpanded(true);
                }}
                title="Fullscreen Interactive Viewer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-neutral-200 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
              >
                <Maximize2 className="h-3 w-3 text-emerald-400" />
                <span>Expand &amp; Pan</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowCode((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
            >
              <Code2 className="h-3 w-3" />
              <span>{showCode ? "View Blueprint" : "View Code"}</span>
            </button>

            <button
              type="button"
              onClick={() => void copyCode()}
              aria-label="Copy diagram source"
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copiedCode ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Inline Content Area */}
        {showCode ? (
          <pre className="overflow-x-auto p-4 text-xs font-mono text-neutral-300 bg-[#07070A]">
            <code>{chart.trim()}</code>
          </pre>
        ) : loading ? (
          <div className="flex min-h-[240px] items-center justify-center p-8 text-xs text-neutral-400 font-mono gap-2.5">
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            <span>Rendering interactive architecture diagram...</span>
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
            onClick={() => {
              handleResetView();
              setIsExpanded(true);
            }}
            title="Click to open interactive fullscreen pan & zoom viewer"
            className="overflow-x-auto p-6 sm:p-8 min-h-[300px] flex items-center justify-center bg-[#07070A]/50 cursor-zoom-in relative select-none"
          >
            <div
              style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
              className="transition-transform duration-150 [&_svg]:min-w-[600px] sm:[&_svg]:min-w-[760px] [&_svg]:max-w-none [&_svg]:h-auto flex justify-center pointer-events-none"
              dangerouslySetInnerHTML={{ __html: svgHtml }}
            />
            {/* Click-to-interact hover overlay hint */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover/diagram:opacity-100 transition-opacity bg-black/70 backdrop-blur-md border border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-mono text-neutral-300 flex items-center gap-1.5 pointer-events-none">
              <Move className="h-3 w-3 text-emerald-400" />
              <span>Click to pan &amp; zoom</span>
            </div>
          </div>
        )}
      </div>

      {/* ────────────────── FULLSCREEN INTERACTIVE LIGHTBOX MODAL ────────────────── */}
      {isExpanded && svgHtml && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#050507]/95 backdrop-blur-xl animate-in fade-in duration-200 select-none overflow-hidden">
          {/* Top Control Bar */}
          <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#07070A]/80 px-4 sm:px-6 py-3.5 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 shadow-sm">
                <Network className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-sans text-sm font-bold text-white tracking-tight">
                  Architecture Blueprint — Interactive Canvas
                </h3>
                <p className="text-[11px] text-neutral-400 font-mono">
                  Drag with mouse to pan · Scroll wheel to zoom · Double-click to reset
                </p>
              </div>
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={downloadPng}
                title="Download 2x High-Resolution PNG"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-mono font-medium text-neutral-200 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-emerald-400" />
                <span>Export PNG</span>
              </button>

              <button
                type="button"
                onClick={copySvg}
                title="Copy Vector SVG to Clipboard"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-mono font-medium text-neutral-200 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
              >
                {copiedSvg ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <FileCode className="h-3.5 w-3.5 text-indigo-400" />}
                <span>{copiedSvg ? "SVG Copied" : "Copy SVG"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="rounded-lg border border-white/10 bg-white/[0.06] p-2 text-neutral-300 hover:bg-white hover:text-black transition-all cursor-pointer shadow-sm"
                aria-label="Exit fullscreen"
                title="Close (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Interactive Pan & Zoom Canvas */}
          <div
            ref={viewportRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            onDoubleClick={handleResetView}
            className={`flex-1 relative overflow-hidden flex items-center justify-center p-6 bg-[#050507] ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            {/* Background architectural grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#ffffff 1px, #050507 1px)",
                backgroundSize: "24px 24px",
                backgroundPosition: "0 0, 12px 12px",
              }}
            />

            {/* Transformed SVG Container */}
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                transition: isDragging ? "none" : "transform 0.08s ease-out",
              }}
              className="[&_svg]:min-w-[850px] sm:[&_svg]:min-w-[1100px] [&_svg]:max-w-none [&_svg]:h-auto flex justify-center pointer-events-none drop-shadow-2xl"
              dangerouslySetInnerHTML={{ __html: svgHtml }}
            />

            {/* Bottom HUD: Floating Controls Pill */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-2xl border border-white/15 bg-[#0A0A0E]/90 p-1.5 shadow-2xl backdrop-blur-md">
              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom Out (-)"
                className="rounded-xl p-2 text-neutral-400 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
              >
                <ZoomOut className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleResetView}
                title="Reset to 100% and Center (R / 0)"
                className="px-2.5 py-1 font-mono text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                {Math.round(zoom * 100)}%
              </button>

              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom In (+)"
                className="rounded-xl p-2 text-neutral-400 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
              >
                <ZoomIn className="h-4 w-4" />
              </button>

              <div className="h-4 w-[1px] bg-white/10 mx-1" />

              <button
                type="button"
                onClick={handleResetView}
                title="Reset Position (Pan 0,0 & Zoom 100%)"
                className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-mono text-neutral-400 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <div className="h-4 w-[1px] bg-white/10 mx-1" />

              <button
                type="button"
                onClick={downloadPng}
                title="Download High-Res PNG"
                className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-mono text-emerald-400 hover:bg-white/[0.08] hover:text-emerald-300 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">PNG</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                title="Exit Fullscreen (Esc)"
                className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-mono text-neutral-400 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </div>

            {/* Shortcut helper badge on bottom left */}
            <div className="hidden lg:flex absolute bottom-6 left-6 items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-3 py-1.5 text-[11px] font-mono text-neutral-400 backdrop-blur-md pointer-events-none">
              <Move className="h-3.5 w-3.5 text-emerald-400" />
              <span>Pan: Drag canvas · Zoom: Scroll wheel · Esc to exit</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
