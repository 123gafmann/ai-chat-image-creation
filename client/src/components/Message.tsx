import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { Message as MessageType } from "@/types/chat";
import { TypingIndicator } from "./TypingIndicator";
import { ToolCallIndicator } from "./ToolCallIndicator";

export const Message = memo(function Message({ message }: { message: MessageType }) {
  const isUser = message.role === "user";
  const isEmpty = message.content === "" && !message.toolCall && !message.imageUrl;

  return (
    <div className={cn("flex mb-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold mr-3 shrink-0 mt-0.5">
          AI
        </div>
      )}

      <div className={cn("max-w-[75%]", isUser && "max-w-[60%]")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-secondary text-secondary-foreground rounded-tl-sm"
          )}
        >
          {message.status === "streaming" && isEmpty ? (
            <TypingIndicator />
          ) : (
            <>
              {message.content && (
                <div className="prose text-inherit text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}

              {message.imageUrl && (
                <img
                  src={message.imageUrl}
                  alt="Generated image"
                  className="mt-2 rounded-lg max-w-full object-contain"
                  style={{ maxHeight: 480 }}
                />
              )}

              {message.toolCall && <ToolCallIndicator toolCall={message.toolCall} />}
            </>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold ml-3 shrink-0 mt-0.5">
          U
        </div>
      )}
    </div>
  );
});
