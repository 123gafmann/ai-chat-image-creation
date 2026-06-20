import { useState, type KeyboardEvent } from "react";
import { Send, Square, Trash2, MessageSquare, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useChatContext } from "@/store/ChatContext";
import { useChat } from "@/hooks/useChat";
import { useImageCreate } from "@/hooks/useImageCreate";

export function MessageInput() {
  const { state, mode, setMode } = useChatContext();
  const { sendMessage, abort: abortChat, clear } = useChat();
  const { generate, abort: abortImage } = useImageCreate();
  const [input, setInput] = useState("");

  const isChat = mode === "chat";
  const placeholder = isChat
    ? "Message AI… (Shift+Enter for new line)"
    : "Describe the image you want to create…";

  function handleSubmit() {
    const text = input.trim();
    if (!text || state.isStreaming) return;
    setInput("");
    if (isChat) {
      sendMessage(text);
    } else {
      generate(text);
    }
  }

  function handleAbort() {
    if (isChat) abortChat();
    else abortImage();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="border-t border-border bg-background px-4 py-4 shrink-0">
      <div className="max-w-3xl mx-auto space-y-2">
        {/* Mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg w-fit">
          <button
            onClick={() => setMode("chat")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              isChat
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat
          </button>
          <button
            onClick={() => setMode("image")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              !isChat
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Create Image
          </button>
        </div>

        {/* Input row */}
        <div className="flex items-end gap-2">
          <Textarea
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={state.isStreaming}
            rows={1}
            className="resize-none min-h-[44px] max-h-40 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
          />

          {state.isStreaming ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleAbort}
                  className="shrink-0 h-11 w-11"
                >
                  <Square className="w-4 h-4 fill-current" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Stop</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  onClick={handleSubmit}
                  disabled={!input.trim()}
                  className="shrink-0 h-11 w-11"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isChat ? "Send message" : "Generate image"}</TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>
            {isChat ? "gemma3:12b · web search enabled" : "FLUX.1-schnell · image generation"}
          </span>
          {state.messages.length > 0 && !state.isStreaming && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear conversation</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
