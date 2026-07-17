import { hasGeminiKey } from "@/lib/gemini/client";
import { hasOpenAIKey } from "@/lib/openai/client";

export type LiveProvider = "openai" | "gemini";

export function getLiveProvider(): LiveProvider | null {
  const requested = process.env.AI_PROVIDER?.trim().toLowerCase();

  if (requested === "openai") return hasOpenAIKey() ? "openai" : null;
  if (requested === "gemini") return hasGeminiKey() ? "gemini" : null;

  if (hasOpenAIKey()) return "openai";
  if (hasGeminiKey()) return "gemini";
  return null;
}
