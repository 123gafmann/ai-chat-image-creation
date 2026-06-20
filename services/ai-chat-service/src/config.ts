import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  OLLAMA_HOST: z.string().default("http://localhost:11434"),
  MODEL: z.string().default("gemma3:12b"),
  SERPER_API_KEY: z.string().min(1, "SERPER_API_KEY is required"),
  PORT: z.coerce.number().default(3001),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
