import type { Tool } from "ollama";

export const webSearchTool: Tool = {
  type: "function",
  function: {
    name: "web_search",
    description:
      "Search the internet for real-time information. Use when the user asks about current events, recent news, live data, or anything that may have changed after your training cutoff.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query to execute",
        },
      },
      required: ["query"],
    },
  },
};

export const allTools: Tool[] = [webSearchTool];
