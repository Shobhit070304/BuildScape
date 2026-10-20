"use client";

import { Children, isValidElement, useEffect, useRef, useState, type ComponentProps, type FormEvent, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";
import { Bot, Check, ChevronRight, Copy, LoaderCircle, Send, Sparkles, X } from "lucide-react";
import { api, type AIChatMessage } from "@/lib/api";
import type { Phase, Project } from "@/lib/projects";

interface ChatMessage extends AIChatMessage {
  id: string;
}

interface AIHelpDrawerProps {
  project: Project;
  phase: Phase;
  phaseIndex: number;
  open: boolean;
  onClose: () => void;
}

function CopyablePre({ children }: ComponentProps<"pre">) {
  const [copied, setCopied] = useState(false);
  const codeElement = Children.toArray(children).find(isValidElement);
  const code = codeElement
    ? String((codeElement.props as { children?: ReactNode }).children ?? "").replace(/\n$/, "")
    : "";

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="ai-code-block">
      <button type="button" onClick={copyCode} className="ai-code-copy" aria-label={copied ? "Code copied" : "Copy code"}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre>{children}</pre>
    </div>
  );
}

const markdownComponents: Components = { pre: CopyablePre };

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function AIHelpDrawer({ project, phase, phaseIndex, open, onClose }: AIHelpDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState<{ full: string; displayed: string } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 250);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing?.displayed, isSending]);

  const sendMessage = async (rawText: string) => {
    const content = rawText.trim();
    if (!content || isSending || typing || content.length > 3000) return;

    const userMessage: ChatMessage = { id: newId(), role: "user", content };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setIsSending(true);
    setTyping({ full: "", displayed: "" });

    const history = nextMessages.slice(-6).map(({ role, content: text }) => ({
      role,
      content: text.slice(-2000),
    }));

    try {
      let fullReply = "";
      await api.streamProjectAIHelp(project.slug, phase.id, history, (chunk) => {
        fullReply += chunk;
        setTyping({ full: fullReply, displayed: fullReply });
      });
      if (!fullReply.trim()) throw new Error("The project AI guide returned an empty answer. Please try again.");
      setMessages((current) => [...current, { id: newId(), role: "assistant", content: fullReply }]);
      setTyping(null);
    } catch (requestError) {
      setTyping(null);
      setError(requestError instanceof Error ? requestError.message : "Could not reach the project AI guide. Try again.");
    } finally {
      setIsSending(false);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(draft);
  };

  const suggestions = [
    `Explain phase ${phaseIndex + 1} in simple steps`,
    "What should I implement first?",
    "Help me debug an error",
  ];

  return (
    <>
      <button
        type="button"
        aria-label="Close project AI help overlay"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-[70] bg-black/55 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-ai-title"
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-y-0 right-0 z-[71] flex h-dvh w-full max-w-[min(100vw,30rem)] flex-col border-l border-border bg-surface-card shadow-2xl shadow-black/40 transition-transform duration-300 ease-[cubic-bezier(.22,.8,.25,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <header className="shrink-0 border-b border-border px-4 py-4 sm:px-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-amber-700/30 bg-amber-950/30 text-accent">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 id="project-ai-title" className="font-serif text-base font-semibold text-text">Project AI Guide</h2>
                <Sparkles className="h-3.5 w-3.5 text-accent" />
              </div>
              <p className="mt-0.5 truncate text-xs text-text-muted">{project.title} · Phase {phaseIndex + 1}: {phase.title}</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close AI help" className="rounded-lg p-2 text-text-muted transition hover:bg-surface-raised hover:text-text">
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5" aria-live="polite">
          {messages.length === 0 && !typing && (
            <div className="pt-5">
              <p className="text-sm leading-relaxed text-text-muted">
                Ask about this project, its code, commands, or the current phase. I’ll keep the help focused on this build.
              </p>
              <div className="mt-5 space-y-2">
                {suggestions.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => void sendMessage(suggestion)} disabled={isSending} className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-left text-xs text-text-muted transition hover:border-border-hover hover:bg-surface-raised hover:text-text disabled:opacity-50">
                    {suggestion}<ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-faint" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "user" ? (
                <div className="max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-br-md border border-amber-700/20 bg-amber-950/20 px-3.5 py-2.5 text-[13px] leading-relaxed text-text">{message.content}</div>
              ) : (
                <div className="min-w-0 max-w-[96%] rounded-2xl rounded-bl-md border border-border bg-surface px-3.5 py-2.5 text-[13px] leading-relaxed text-text">
                  <div className="prose ai-prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={markdownComponents}>{message.content}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}

          {typing && (
            <div className="flex justify-start">
              <div className="min-w-0 max-w-[96%] rounded-2xl rounded-bl-md border border-border bg-surface px-3.5 py-2.5 text-[13px] leading-relaxed text-text">
                <div className="prose ai-prose max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={markdownComponents}>{typing.displayed}</ReactMarkdown>
                  <span className="ai-typewriter-caret" aria-hidden="true" />
                </div>
              </div>
            </div>
          )}

          {isSending && !typing && (
            <div className="flex items-center gap-2 text-xs text-text-faint"><LoaderCircle className="h-3.5 w-3.5 animate-spin text-accent" /> Thinking about this project…</div>
          )}
          {error && <p role="alert" className="rounded-lg border border-rose-900/40 bg-rose-950/20 px-3 py-2 text-xs leading-relaxed text-rose-300">{error}</p>}
          <div ref={endOfMessagesRef} />
        </div>

        <form onSubmit={onSubmit} className="shrink-0 border-t border-border bg-surface-card p-3 sm:p-4">
          <div className="rounded-xl border border-border bg-surface px-3 py-2 transition focus-within:border-amber-700/50 focus-within:ring-1 focus-within:ring-amber-700/20">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value.slice(0, 3000))}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage(draft);
                }
              }}
              rows={2}
              maxLength={3000}
              placeholder="Ask about this project…"
              aria-label="Message the project AI guide"
              className="max-h-32 min-h-12 w-full resize-y bg-transparent text-[13px] leading-relaxed text-text outline-none placeholder:text-text-faint"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-text-faint">Enter to send · Shift+Enter for a new line</span>
              <button type="submit" disabled={!draft.trim() || isSending || Boolean(typing)} aria-label="Send message" className="grid h-8 w-8 place-items-center rounded-lg bg-amber-700 text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40">
                {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <p className="mt-2 text-center text-[10px] text-text-faint">Answers are limited to this project and phase. Review generated code before using it.</p>
        </form>
      </aside>
    </>
  );
}
