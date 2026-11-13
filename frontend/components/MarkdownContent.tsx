"use client";

import { Children, isValidElement, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy } from "lucide-react";
import { MermaidDiagram } from "@/components/MermaidDiagram";

function getText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return getText(node.props.children);
  return Children.toArray(node).map(getText).join("");
}

function CopyablePre({ children, className, ...props }: ComponentProps<"pre">) {
  const [copied, setCopied] = useState(false);
  const code = getText(children);

  // Check if this pre block is a mermaid diagram
  const isMermaid =
    (typeof className === "string" && className.includes("language-mermaid")) ||
    (isValidElement<{ className?: string }>(children) &&
      typeof children.props.className === "string" &&
      children.props.className.includes("language-mermaid")) ||
    /^\s*(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram-v2|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)\b/m.test(
      code.trim()
    );

  if (isMermaid) {
    return <MermaidDiagram chart={code} />;
  }

  let lang = "";
  if (typeof className === "string") {
    const match = className.match(/language-([a-zA-Z0-9_-]+)/);
    if (match) lang = match[1];
  }
  if (!lang && isValidElement<{ className?: string }>(children) && typeof children.props.className === "string") {
    const match = children.props.className.match(/language-([a-zA-Z0-9_-]+)/);
    if (match) lang = match[1];
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="group/code relative my-5 w-full max-w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#07090F] shadow-2xl shadow-black/80">
      {/* Code Header Bar with Window Controls & Language Tag */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#05060A] px-4 py-2">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 opacity-80">
            <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]/70" />
          </div>
          <span className="font-mono text-[11px] font-semibold text-neutral-400 uppercase tracking-wider ml-1">
            {lang ? lang.toUpperCase() : "CODE"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => void copyCode()}
          aria-label={copied ? "Code copied" : "Copy code"}
          title={copied ? "Copied" : "Copy code or command"}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-neutral-300 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      <pre {...props} className={`!mt-0 !p-4 sm:!p-5 overflow-x-auto bg-[#07090F] text-[#E2E8F0] font-mono text-[13px] leading-relaxed ${className ?? ""}`}>
        {children}
      </pre>
    </div>
  );
}

const components: Components = {
  pre: CopyablePre,
  table({ children, ...props }) {
    return (
      <div className="my-5 w-full overflow-x-auto rounded-xl border border-[#334155] bg-[#141D2E]/60 shadow-sm">
        <table {...props}>{children}</table>
      </div>
    );
  },
  img({ alt, ...props }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...props}
        alt={alt || ""}
        className="my-4 h-auto max-w-full rounded-xl border border-[#334155]"
        loading="lazy"
      />
    );
  },
  a({ href, children, ...props }) {
    const isExternal = href?.startsWith("http");
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-indigo-400 hover:text-indigo-300 transition-colors"
        {...props}
      >
        {children}
      </a>
    );
  },
};

export function MarkdownContent({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={`prose min-w-0 max-w-none break-words ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
