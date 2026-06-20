import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { ollama } from "../services/ollama.js";
import { executeWebSearch } from "../services/webSearch.js";
import { sendSSE } from "../lib/sseWriter.js";
import { config } from "../config.js";
import type { Message } from "ollama";

const SYSTEM_PROMPT = `You are a helpful AI assistant with access to web search.

If you need current or real-time information to answer accurately (news, weather, live data, recent events), output ONLY this as your entire response:
SEARCH: <your search query>

Otherwise, answer the user directly and helpfully. Do not output SEARCH: unless you truly need real-time information.`;

const SEARCH_PREFIX = "SEARCH:";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "tool", "system"]),
  content: z.string(),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1),
});

export const chatRouter = new Hono();

chatRouter.post(
  "/",
  zValidator("json", bodySchema),
  async (c) => {
    const { messages } = c.req.valid("json");
    const clientId = c.req.header("X-Client-ID") ?? "unknown";

    return streamSSE(c, async (stream) => {
      console.log(`[chat] session=${clientId} messages=${messages.length}`);

      const history: Message[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...(messages as Message[]),
      ];

      // Phase 1: non-streaming call to detect search intent
      const firstResponse = await ollama.chat({
        model: config.MODEL,
        messages: history,
        stream: false,
      });

      const firstContent = firstResponse.message.content.trim();

      if (firstContent.startsWith(SEARCH_PREFIX)) {
        // Model wants to search — extract query, execute, then stream final answer
        const query = firstContent.slice(SEARCH_PREFIX.length).trim();

        await sendSSE(stream, "tool_start", { name: "web_search", query });

        let searchResult: string;
        try {
          searchResult = await executeWebSearch(query);
        } catch (err) {
          searchResult = `Search failed: ${err instanceof Error ? err.message : "unknown error"}`;
        }

        await sendSSE(stream, "tool_result", { name: "web_search", result: searchResult.slice(0, 500) });

        // Build context with search results and stream final answer
        const augmentedHistory: Message[] = [
          ...history,
          { role: "assistant", content: firstContent },
          {
            role: "user",
            content: `Here are the web search results for "${query}":\n\n${searchResult}\n\nNow please answer the original question using this information.`,
          },
        ];

        const finalResponse = await ollama.chat({
          model: config.MODEL,
          messages: augmentedHistory,
          stream: true,
        });

        for await (const chunk of finalResponse) {
          if (chunk.message.content) {
            await sendSSE(stream, "token", { content: chunk.message.content });
          }
        }
      } else {
        // No search needed — emit buffered content as token events
        await sendSSE(stream, "token", { content: firstContent });
      }

      await sendSSE(stream, "done", {});
    });
  }
);
