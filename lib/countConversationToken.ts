/**
 * Approximate token count for a conversation (Gemini-compatible estimate).
 * Uses ~4 characters per token heuristic for English text.
 */
export function countConversationTokens(
  messages: { role?: string; content?: string }[]
): number {
  if (!Array.isArray(messages) || messages.length === 0) return 0;
  const totalChars = messages.reduce(
    (sum, m) => sum + (typeof m.content === "string" ? m.content.length : 0),
    0
  );
  return Math.ceil(totalChars / 4);
}
