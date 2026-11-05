/** Safely serialize JSON-LD so user-managed text cannot close its script element. */
export function serializeStructuredData(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
