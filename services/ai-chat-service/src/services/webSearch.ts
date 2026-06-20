import { config } from "../config.js";

interface SerperResult {
  organic?: Array<{ title: string; snippet: string; link: string }>;
  answerBox?: { answer?: string; snippet?: string };
}

export async function executeWebSearch(query: string): Promise<string> {
  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": config.SERPER_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query }),
  });

  if (!response.ok) {
    throw new Error(`Web search failed: ${response.statusText}`);
  }

  const data = (await response.json()) as SerperResult;

  const parts: string[] = [];

  if (data.answerBox?.answer) {
    parts.push(`Answer: ${data.answerBox.answer}`);
  } else if (data.answerBox?.snippet) {
    parts.push(`Answer: ${data.answerBox.snippet}`);
  }

  const organic = data.organic?.slice(0, 3) ?? [];
  for (const result of organic) {
    const snippet = result.snippet?.slice(0, 300) ?? "";
    parts.push(`${result.title}: ${snippet}`);
  }

  return parts.join("\n\n") || "No results found.";
}
