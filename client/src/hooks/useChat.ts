import { useRef, useCallback } from "react";
import { useChatContext } from "../store/ChatContext";
import { sendChatMessage } from "../api/chatApi";
import type { Message } from "../types/chat";

function parseSSEChunk(raw: string): Array<{ event: string; data: Record<string, string> }> {
  const events: Array<{ event: string; data: Record<string, string> }> = [];
  const blocks = raw.split(/\n\n+/);
  for (const block of blocks) {
    if (!block.trim()) continue;
    let event = "message";
    let dataStr = "";
    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) dataStr = line.slice(5).trim();
    }
    if (dataStr) {
      try {
        events.push({ event, data: JSON.parse(dataStr) });
      } catch {
        // ignore malformed chunks
      }
    }
  }
  return events;
}

export function useChat() {
  const { state, dispatch, sessionId } = useChatContext();
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (userContent: string) => {
      if (state.isStreaming) return;

      dispatch({ type: "ADD_USER_MESSAGE", content: userContent });

      const stubId = crypto.randomUUID();
      dispatch({ type: "ADD_ASSISTANT_STUB", id: stubId });

      const outgoingMessages: Array<{ role: "user" | "assistant"; content: string }> = [
        ...state.messages
          .filter((m): m is Message & { role: "user" | "assistant" } =>
            m.role === "user" || m.role === "assistant"
          )
          .map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: userContent },
      ];

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const reader = await sendChatMessage(outgoingMessages, controller.signal, sessionId);
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const boundary = buffer.lastIndexOf("\n\n");
          if (boundary === -1) continue;

          const toProcess = buffer.slice(0, boundary + 2);
          buffer = buffer.slice(boundary + 2);

          for (const { event, data } of parseSSEChunk(toProcess)) {
            if (event === "token" && data.content) {
              dispatch({ type: "APPEND_CHUNK", content: data.content });
            } else if (event === "tool_start") {
              dispatch({ type: "SET_TOOL_PENDING", name: data.name ?? "", query: data.query ?? "" });
            } else if (event === "tool_result") {
              dispatch({ type: "SET_TOOL_RESULT", result: data.result ?? "" });
            } else if (event === "done") {
              dispatch({ type: "SET_COMPLETE" });
            } else if (event === "error") {
              dispatch({ type: "SET_ERROR", message: data.message ?? "Unknown error" });
            }
          }
        }

        dispatch({ type: "SET_COMPLETE" });
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          dispatch({ type: "SET_COMPLETE" });
        } else {
          dispatch({ type: "SET_ERROR", message: (err as Error).message });
        }
      } finally {
        abortRef.current = null;
      }
    },
    [state, dispatch]
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    dispatch({ type: "CLEAR_CONVERSATION" });
  }, [dispatch]);

  return { sendMessage, abort, clear };
}
