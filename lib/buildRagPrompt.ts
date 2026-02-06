export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

/**
 * Builds a single prompt string for Gemini RAG: system instructions + context + conversation.
 */
export function buildRagPrompt(
  messages: ChatMessage[],
  context: string
): string {
  const conversationText = messages
    .filter((m) => m.content?.trim())
    .map((m) => `${m.role.toUpperCase()}: ${m.content.trim()}`)
    .join("\n\n");

  return `You are Sarah, a helpful support assistant. Answer using ONLY the information in the CONTEXT section below. If the answer is not in the context, say you don't know. Be clear and concise. When relevant, you may refer to yourself as Sarah.

CONTEXT:
${context || "(No context provided.)"}

CONVERSATION:
${conversationText || "USER: (no messages)"}

Answer the user's last message based on the context above.`.trim();
}
