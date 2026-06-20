import { createContext, useContext, useReducer, useState, useRef, type ReactNode } from "react";
import { chatReducer, initialState, type ChatAction } from "./chatReducer";
import type { ChatState, Mode } from "../types/chat";

interface ChatContextValue {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  mode: Mode;
  setMode: (mode: Mode) => void;
  sessionId: string;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [mode, setMode] = useState<Mode>("chat");
  const sessionId = useRef(crypto.randomUUID()).current;

  return (
    <ChatContext.Provider value={{ state, dispatch, mode, setMode, sessionId }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used inside ChatProvider");
  return ctx;
}
