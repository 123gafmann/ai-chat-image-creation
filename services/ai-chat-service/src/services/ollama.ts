import { Ollama } from "ollama";
import { config } from "../config.js";

export const ollama = new Ollama({ host: config.OLLAMA_HOST });
