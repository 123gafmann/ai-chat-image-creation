export interface OutgoingMessage {
  role: "user" | "assistant";
  content: string;
}

export async function sendChatMessage(
  messages: OutgoingMessage[],
  signal?: AbortSignal,
  sessionId?: string
): Promise<ReadableStreamDefaultReader<Uint8Array>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (sessionId) headers["X-Client-ID"] = sessionId;

  const response = await fetch("/api/chat", {
    method: "POST",
    headers,
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error("No response body");
  }

  return response.body.getReader();
}
