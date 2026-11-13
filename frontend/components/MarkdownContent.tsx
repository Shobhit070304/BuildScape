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
    <div className="group/code relative my-4 w-full max-w-full overflow-hidden rounded-xl border border-[#334155] shadow-lg shadow-black/40">
      <button
        type="button"
        onClick={() => void copyCode()}
        aria-label={copied ? "Code copied" : "Copy code"}
        title={copied ? "Copied" : "Copy code or command"}
        className="absolute right-2.5 top-2.5 z-10 inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-2.5 py-1 text-[11px] font-medium text-slate-300 opacity-100 transition-all hover:border-indigo-500 hover:text-white hover:bg-slate-700 sm:opacity-0 sm:group-hover/code:opacity-100 sm:focus:opacity-100 backdrop-blur-xs cursor-pointer"
      >
        {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre {...props} className={`!mt-0 !pt-10 overflow-x-auto bg-[#0B0F19] text-[#E2E8F0] ${className ?? ""}`}>
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
