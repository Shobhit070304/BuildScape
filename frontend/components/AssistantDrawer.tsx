"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bot, Eraser, Loader2, Send, Sparkles, X } from "lucide-react";
import { api, streamAssistantChat, type AssistantChatMessage } from "@/lib/api";
import type { Phase, Project } from "@/lib/projects";
import { MarkdownContent } from "@/components/MarkdownContent";

interface DrawerMessage extends AssistantChatMessage {
  id: string;
}

interface AssistantDrawerProps {
  project: Project;
  phase: Phase;
  onClose: () => void;
}

export function AssistantDrawer({ project, phase, onClose }: AssistantDrawerProps) {
  const [messages, setMessages] = useState<DrawerMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const closeRef = useRef(onClose);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.querySelector<HTMLElement>("button")?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key === "Tab") {
        const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ));
        if (focusable.length === 0) {
          event.preventDefault();
        } else if (event.shiftKey && document.activeElement === focusable[0]) {
          event.preventDefault();
          focusable[focusable.length - 1].focus();
        } else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
          event.preventDefault();
          focusable[0].focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      requestRef.current?.abort();
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.getAssistantHistory(project.slug, phase.id)
      .then(({ messages: history }) => {
        if (!cancelled) {
          setMessages(history.map((message) => ({ ...message, id: crypto.randomUUID() })));
          setError(null);
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Could not load this conversation.");
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });
    return () => { cancelled = true; };
  }, [project.slug, phase.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: sending ? "smooth" : "auto", block: "end" });
  }, [messages, sending]);

  const submitMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending || loadingHistory) return;

    setError(null);
    setDraft("");
    setSending(true);
    const userMessage: DrawerMessage = { id: crypto.randomUUID(), role: "user", text };
    const assistantId = crypto.randomUUID();
    setMessages((current) => [...current, userMessage, { id: assistantId, role: "assistant", text: "" }]);
    const controller = new AbortController();
    requestRef.current = controller;

    try {
      await streamAssistantChat(project.slug, phase.id, text, (delta) => {
        setMessages((current) => current.map((message) =>
          message.id === assistantId ? { ...message, text: message.text + delta } : message
        ));
      }, controller.signal);
    } catch (requestError) {
      if (!controller.signal.aborted) {
        setMessages((current) => current.filter((message) => message.id !== assistantId));
        setError(requestError instanceof Error ? requestError.message : "The assistant could not answer right now.");
      }
    } finally {
      if (!controller.signal.aborted) {
        setSending(false);
        requestRef.current = null;
        textareaRef.current?.focus();
      }
    }
  };

  const clearConversation = async () => {
    if (sending || loadingHistory || messages.length === 0) return;
    setError(null);
    try {
      await api.clearAssistantHistory(project.slug, phase.id);
      setMessages([]);
    } catch (clearError) {
      setError(clearError instanceof Error ? clearError.message : "Could not clear this conversation.");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] bg-black/60" onMouseDown={(event) => { if (event.target === event.currentTarget) closeRef.current(); }}>
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-title"
        className="absolute inset-0 flex flex-col border-l border-[#342f27] bg-[#0d0c0a] shadow-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[min(28rem,100vw)]"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[#24211b] px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-800/50 bg-amber-950/40 text-amber-300">
              <Bot className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 id="assistant-title" className="font-serif text-base font-semibold text-[#f0eae1]">BuildScape AI</h2>
              <p className="mt-0.5 truncate text-xs text-text-muted">{project.title} · {phase.title}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => void clearConversation()}
              disabled={sending || loadingHistory || messages.length === 0}
              aria-label="Clear conversation"
              title="Clear conversation"
              className="rounded-lg p-2 text-text-muted transition-colors hover:bg-[#201d18] hover:text-[#e4ddd3] disabled:opacity-40"
            >
              <Eraser className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => closeRef.current()} aria-label="Close AI assistant" className="rounded-lg p-2 text-text-muted transition-colors hover:bg-[#201d18] hover:text-[#e4ddd3]">
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-5" aria-live="polite" aria-busy={loadingHistory}>
          <div className="mb-4 rounded-xl border border-amber-900/30 bg-amber-950/15 p-3 text-xs leading-relaxed text-[#b8ad9e]">
            Ask for a hint, explanation, or debugging help. Your question and phase text are sent to Groq; this chat is stored in Upstash for 24 hours. Saved notes are not included. Don’t enter passwords, API keys, or sensitive information.
          </div>

          {loadingHistory && (
            <div className="flex items-center gap-2 py-4 text-xs text-text-muted"><Loader2 className="h-4 w-4 animate-spin" />Loading conversation…</div>
          )}

          {!loadingHistory && messages.length === 0 && (
            <div className="mt-2 rounded-xl border border-[#24211b] bg-[#12110e] p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#e4ddd3]"><Sparkles className="h-4 w-4 text-amber-400" />What are you working through?</div>
              <p className="mb-3 text-xs leading-relaxed text-text-muted">I’ll use this project phase to keep answers focused and help you reason through the next step.</p>
              <div className="flex flex-wrap gap-2">
                {["Explain this phase", "Give me a hint", "Help me debug"].map((prompt) => (
                  <button key={prompt} type="button" onClick={() => { setDraft(prompt); textareaRef.current?.focus(); }} className="rounded-full border border-[#3a3329] px-2.5 py-1 text-[11px] text-[#c4bbb0] transition-colors hover:border-amber-800/70 hover:text-amber-200">{prompt}</button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 pt-3">
            {messages.map((message) => (
              <div key={message.id} className={`max-w-[92%] rounded-xl px-3.5 py-3 text-sm leading-relaxed ${message.role === "user" ? "ml-auto bg-amber-700/25 text-[#f0eae1]" : "mr-auto border border-[#29251f] bg-[#15130f] text-[#d4cbbd]"}`}>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-faint">{message.role === "user" ? "You" : "BuildScape AI"}</p>
                {message.text ? message.role === "assistant" ? (
                  <MarkdownContent className="assistant-markdown text-sm leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ol]:my-2">
                    {message.text}
                  </MarkdownContent>
                ) : (
                  <p className="whitespace-pre-wrap wrap-break-word">{message.text}</p>
                ) : sending && <span className="inline-flex items-center gap-2 text-xs text-text-muted"><Loader2 className="h-3.5 w-3.5 animate-spin" />Thinking…</span>}
              </div>
            ))}
          </div>
          {error && <p role="alert" className="mt-3 rounded-lg border border-red-900/50 bg-red-950/25 p-3 text-xs leading-relaxed text-red-200">{error}</p>}
          <div ref={endRef} />
        </div>

        <form ref={formRef} onSubmit={(event) => void submitMessage(event)} className="shrink-0 border-t border-[#24211b] bg-[#100f0c] p-4 sm:p-5">
          <label htmlFor="assistant-message" className="sr-only">Ask the AI assistant about this phase</label>
          <div className="rounded-xl border border-[#3a3329] bg-[#0c0b09] p-2 focus-within:border-amber-800/70">
            <textarea
              ref={textareaRef}
              id="assistant-message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  formRef.current?.requestSubmit();
                }
              }}
              maxLength={2000}
              rows={3}
              placeholder="Ask about this phase…"
              className="max-h-36 w-full resize-y bg-transparent px-2 py-1 text-sm text-[#e4ddd3] outline-none placeholder:text-[#6b6256]"
              disabled={loadingHistory || sending}
            />
            <div className="flex items-center justify-between gap-3 px-2 pb-1">
              <span className="text-[10px] text-text-faint">Enter to send · Shift+Enter for a new line</span>
              <button type="submit" disabled={loadingHistory || sending || !draft.trim()} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-stone-950 transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-45">
                {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {sending ? "Answering" : "Send"}
              </button>
            </div>
          </div>
          <p className="mt-2 text-center text-[10px] leading-relaxed text-text-faint">Groq can make mistakes. Don’t enter passwords, API keys, or sensitive personal information.</p>
        </form>
      </section>
    </div>,
    document.body
  );
}
