import { Globe } from "lucide-react";
import type { ToolCall } from "@/types/chat";

export function ToolCallIndicator({ toolCall }: { toolCall: ToolCall }) {
  const isSearching = !toolCall.result;

  return (
    <div className="mt-3 rounded-lg border border-border bg-secondary/50 p-3 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <Globe className="w-4 h-4 text-primary shrink-0" />
        <span className="font-medium text-foreground">Web search</span>
        {isSearching && (
          <span className="flex items-center gap-1 text-muted-foreground text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            searching…
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Query: &ldquo;{toolCall.query}&rdquo;
      </p>
      {toolCall.result && (
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
          {toolCall.result}
        </p>
      )}
    </div>
  );
}
