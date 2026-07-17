import type { GenerateContentResponse } from "@google/genai";

import { GEMINI_MODEL, getGeminiClient } from "./client";

export interface GroundedSource {
  title: string;
  url: string;
}

export interface GroundedSupport {
  text: string;
  sourceIndexes: number[];
}

export interface GroundedSearchResult {
  text: string;
  sources: GroundedSource[];
  supports: GroundedSupport[];
  searchSuggestionHtml: string | null;
}

function normalizedHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

export function extractGeminiGrounding(
  response: GenerateContentResponse,
): Pick<GroundedSearchResult, "sources" | "supports" | "searchSuggestionHtml"> {
  const sources: GroundedSource[] = [];
  const sourceIndexMap = new Map<string, number>();
  const supports: GroundedSupport[] = [];
  let searchSuggestionHtml: string | null = null;

  for (const candidate of response.candidates ?? []) {
    const originalToNormalized = new Map<number, number>();
    const renderedContent =
      candidate.groundingMetadata?.searchEntryPoint?.renderedContent?.trim();
    if (!searchSuggestionHtml && renderedContent) {
      searchSuggestionHtml = renderedContent.slice(0, 50_000);
    }
    const chunks = candidate.groundingMetadata?.groundingChunks ?? [];
    chunks.forEach((chunk, originalIndex) => {
      const url = chunk.web?.uri ? normalizedHttpUrl(chunk.web.uri) : null;
      if (!url) return;
      let normalizedIndex = sourceIndexMap.get(url);
      if (normalizedIndex === undefined) {
        normalizedIndex = sources.length;
        sourceIndexMap.set(url, normalizedIndex);
        sources.push({
          title: chunk.web?.title?.trim() || new URL(url).hostname,
          url,
        });
      }
      originalToNormalized.set(originalIndex, normalizedIndex);
    });

    for (const support of candidate.groundingMetadata?.groundingSupports ??
      []) {
      const text = support.segment?.text?.trim();
      const sourceIndexes = [
        ...new Set(
          (support.groundingChunkIndices ?? [])
            .map((index) => originalToNormalized.get(index))
            .filter((index): index is number => index !== undefined),
        ),
      ];
      if (text && sourceIndexes.length) supports.push({ text, sourceIndexes });
    }
  }

  return { sources, supports, searchSuggestionHtml };
}

export async function searchGeminiGrounded(
  prompt: string,
  systemInstruction: string,
): Promise<GroundedSearchResult> {
  const response = await getGeminiClient().models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.1,
      maxOutputTokens: 5_000,
      tools: [{ googleSearch: {} }],
    },
  });
  return {
    text: response.text?.trim() || "",
    ...extractGeminiGrounding(response),
  };
}
