import { Bot, Wifi } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatProvider } from "@/store/ChatContext";
import { ChatWindow } from "./components/ChatWindow";
import { MessageInput } from "./components/MessageInput";

export default function App() {
  return (
    <TooltipProvider delayDuration={300}>
      <ChatProvider>
        <div className="flex flex-col h-full bg-background">
          <header className="border-b border-border px-4 py-3 flex items-center justify-between shrink-0 bg-card">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-none">AI Chat</p>
                <p className="text-xs text-muted-foreground mt-0.5">gemma3:12b · web search enabled</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wifi className="w-3.5 h-3.5 text-green-500" />
              <span>Online</span>
            </div>
          </header>

          <ChatWindow />
          <MessageInput />
        </div>
      </ChatProvider>
    </TooltipProvider>
  );
}
