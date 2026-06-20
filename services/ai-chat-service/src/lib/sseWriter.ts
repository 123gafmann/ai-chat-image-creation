import type { SSEStreamingApi } from "hono/streaming";

export type SSEEventType = "token" | "tool_start" | "tool_result" | "done" | "error";

export async function sendSSE(
  stream: SSEStreamingApi,
  event: SSEEventType,
  data: Record<string, unknown>
) {
  await stream.writeSSE({ event, data: JSON.stringify(data) });
}
