import { asyncHandler } from "../middleware/asyncHandler";
import {
  clearAssistantHistory,
  getAssistantHistory,
  prepareAssistantChat,
  streamAssistantReply,
} from "../services/assistant.service";

export const getHistory = asyncHandler(async (req, res) => {
  const messages = await getAssistantHistory(
    req.user!.userId,
    String(req.params.projectSlug),
    String(req.params.phaseId)
  );
  res.json({ messages });
});

export const clearHistory = asyncHandler(async (req, res) => {
  await clearAssistantHistory(
    req.user!.userId,
    String(req.params.projectSlug),
    String(req.params.phaseId)
  );
  res.json({ success: true });
});

export const chat = asyncHandler(async (req, res) => {
  const prepared = await prepareAssistantChat(req.user!.userId, req.body ?? {});
  const abortController = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    abortController.abort();
  }, 45_000);
  const handleDisconnect = () => {
    if (!res.writableEnded) abortController.abort();
  };

  res.on("close", handleDisconnect);
  res.status(200);
  res.set({
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-store, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();

  const send = (event: Record<string, unknown>) => {
    if (!res.writableEnded && !res.destroyed) res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  try {
    await streamAssistantReply(prepared, abortController.signal, (text) => send({ type: "delta", text }));
    if (timedOut) send({ type: "error", message: "The assistant took too long to respond. Please try again." });
    else if (!abortController.signal.aborted) send({ type: "done" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The assistant could not answer right now.";
    send({ type: "error", message });
  } finally {
    clearTimeout(timeout);
    res.off("close", handleDisconnect);
    if (!res.writableEnded) res.end();
  }
});
