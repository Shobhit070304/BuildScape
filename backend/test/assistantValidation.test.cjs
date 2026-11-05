const test = require("node:test");
const assert = require("node:assert/strict");
const { prepareAssistantChat } = require("../dist/services/assistant.service");

test("rejects malformed project and phase context before making provider calls", async () => {
  await assert.rejects(
    prepareAssistantChat("user-1", { projectSlug: "../private", phaseId: "phase-1", message: "Help" }),
    { statusCode: 400 }
  );
  await assert.rejects(
    prepareAssistantChat("user-1", { projectSlug: "valid-project", phaseId: "", message: "Help" }),
    { statusCode: 400 }
  );
});

test("rejects blank and oversized assistant prompts", async () => {
  await assert.rejects(
    prepareAssistantChat("user-1", { projectSlug: "valid-project", phaseId: "phase-1", message: "   " }),
    { statusCode: 400 }
  );
  await assert.rejects(
    prepareAssistantChat("user-1", { projectSlug: "valid-project", phaseId: "phase-1", message: "x".repeat(2001) }),
    { statusCode: 400 }
  );
});
