import { MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatContext } from "@/store/ChatContext";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { Message } from "./Message";

export function ChatWindow() {
  const { state } = useChatContext();
  const { containerRef, onScroll } = useAutoScroll(state.messages);

  return (
    <ScrollArea className="flex-1">
      <div ref={containerRef} onScroll={onScroll} className="px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {state.messages.length === 0 && (
            <div className="text-center mt-20 space-y-3">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 text-primary" />
                </div>
              </div>
              <p className="text-lg font-semibold text-foreground">How can I help you?</p>
              <p className="text-sm text-muted-foreground">
                Ask me anything — I can search the web for real-time info.
              </p>
            </div>
          )}

          {state.messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}

          {state.error && (
            <div className="text-center text-destructive-foreground text-sm py-2 bg-destructive/20 rounded-lg px-4 border border-destructive/30">
              {state.error}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
