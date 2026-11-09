"use client";

import { Children, isValidElement, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy } from "lucide-react";

function getText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return getText(node.props.children);
  return Children.toArray(node).map(getText).join("");
}

function CopyablePre({ children, className, ...props }: ComponentProps<"pre">) {
  const [copied, setCopied] = useState(false);
  const code = getText(children);

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
    <div className="group/code relative my-4 w-full max-w-full overflow-hidden rounded-lg">
      <button
        type="button"
        onClick={() => void copyCode()}
        aria-label={copied ? "Code copied" : "Copy code"}
        title={copied ? "Copied" : "Copy code or command"}
        className="absolute right-2 top-2 z-10 inline-flex items-center gap-1.5 rounded-md border border-[#39342c] bg-[#171510] px-2 py-1 text-[10px] font-medium text-[#b9ae9f] opacity-100 transition-colors hover:border-amber-700/60 hover:text-amber-200 sm:opacity-0 sm:group-hover/code:opacity-100 sm:focus:opacity-100"
      >
        {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre {...props} className={`!mt-0 !pt-10 overflow-x-auto ${className ?? ""}`}>
        {children}
      </pre>
    </div>
  );
}

const components: Components = {
  pre: CopyablePre,
  table({ children, ...props }) {
    return (
      <div className="my-5 w-full overflow-x-auto rounded-lg border border-[#262420]">
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
        className="my-4 h-auto max-w-full rounded-lg border border-[#262420]"
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
