export type Role = "user" | "assistant";

export type MessageStatus = "complete" | "streaming" | "tool_pending";

export type Mode = "chat" | "image";

export interface ToolCall {
  name: string;
  query: string;
  result?: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  imageUrl?: string;
  toolCall?: ToolCall;
  status: MessageStatus;
}

export interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
}

export type SSEEventType = "token" | "tool_start" | "tool_result" | "done" | "error";

export interface SSEEvent {
  event: SSEEventType;
  data: Record<string, string>;
}
