import type { ChatState, Message } from "../types/chat";

export type ChatAction =
  | { type: "ADD_USER_MESSAGE"; content: string }
  | { type: "ADD_ASSISTANT_STUB"; id: string }
  | { type: "APPEND_CHUNK"; content: string }
  | { type: "SET_TOOL_PENDING"; name: string; query: string }
  | { type: "SET_TOOL_RESULT"; result: string }
  | { type: "SET_IMAGE_RESULT"; imageUrl: string }
  | { type: "SET_COMPLETE" }
  | { type: "SET_ERROR"; message: string }
  | { type: "CLEAR_CONVERSATION" };

export const initialState: ChatState = {
  messages: [],
  isStreaming: false,
  error: null,
};

function updateLastAssistant(
  messages: Message[],
  updater: (msg: Message) => Message
): Message[] {
  const idx = [...messages].reverse().findIndex((m) => m.role === "assistant");
  if (idx === -1) return messages;
  const realIdx = messages.length - 1 - idx;
  return messages.map((m, i) => (i === realIdx ? updater(m) : m));
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_USER_MESSAGE":
      return {
        ...state,
        error: null,
        isStreaming: true,
        messages: [
          ...state.messages,
          {
            id: crypto.randomUUID(),
            role: "user",
            content: action.content,
            status: "complete",
          },
        ],
      };

    case "ADD_ASSISTANT_STUB":
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: action.id,
            role: "assistant",
            content: "",
            status: "streaming",
          },
        ],
      };

    case "APPEND_CHUNK":
      return {
        ...state,
        messages: updateLastAssistant(state.messages, (m) => ({
          ...m,
          content: m.content + action.content,
          status: "streaming",
        })),
      };

    case "SET_TOOL_PENDING":
      return {
        ...state,
        messages: updateLastAssistant(state.messages, (m) => ({
          ...m,
          status: "tool_pending",
          toolCall: { name: action.name, query: action.query },
        })),
      };

    case "SET_TOOL_RESULT":
      return {
        ...state,
        messages: updateLastAssistant(state.messages, (m) => ({
          ...m,
          status: "streaming",
          toolCall: m.toolCall ? { ...m.toolCall, result: action.result } : undefined,
        })),
      };

    case "SET_IMAGE_RESULT":
      return {
        ...state,
        isStreaming: false,
        messages: updateLastAssistant(state.messages, (m) => ({
          ...m,
          status: "complete",
          imageUrl: action.imageUrl,
        })),
      };

    case "SET_COMPLETE":
      return {
        ...state,
        isStreaming: false,
        messages: updateLastAssistant(state.messages, (m) => ({
          ...m,
          status: "complete",
        })),
      };

    case "SET_ERROR":
      return {
        ...state,
        isStreaming: false,
        error: action.message,
        messages: updateLastAssistant(state.messages, (m) => ({
          ...m,
          status: "complete",
        })),
      };

    case "CLEAR_CONVERSATION":
      return initialState;

    default:
      return state;
  }
}
