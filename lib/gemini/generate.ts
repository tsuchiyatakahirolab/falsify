import { Modality, type GenerateContentResponse } from "@google/genai";

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
  if (GEMINI_MODEL.includes("-live-")) {
    return searchGeminiLiveGrounded(prompt, systemInstruction);
  }

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

async function searchGeminiLiveGrounded(
  prompt: string,
  systemInstruction: string,
): Promise<GroundedSearchResult> {
  const client = getGeminiClient();

  return new Promise((resolve, reject) => {
    let session: { close: () => void } | null = null;
    let settled = false;
    const transcript: string[] = [];
    const groundedResponses: GenerateContentResponse["candidates"] = [];

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      session?.close();
      if (error) {
        reject(error);
        return;
      }
      const response = {
        candidates: groundedResponses,
      } as GenerateContentResponse;
      resolve({
        text: transcript.join(" ").trim(),
        ...extractGeminiGrounding(response),
      });
    };

    const timer = setTimeout(
      () => finish(new Error("Gemini Live grounded search timed out.")),
      45_000,
    );

    void client.live
      .connect({
        model: GEMINI_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          systemInstruction,
          temperature: 0.1,
          tools: [{ googleSearch: {} }],
        },
        callbacks: {
          onmessage(message) {
            const content = message.serverContent;
            const transcription = content?.outputTranscription?.text?.trim();
            if (transcription) transcript.push(transcription);
            if (content?.groundingMetadata) {
              groundedResponses.push({
                groundingMetadata: content.groundingMetadata,
              });
            }
            if (content?.turnComplete) finish();
          },
          onerror(event) {
            finish(
              event.error instanceof Error
                ? event.error
                : new Error(event.message || "Gemini Live connection failed."),
            );
          },
          onclose(event) {
            if (!settled) {
              const reason = event.reason
                .replace(/AIza[0-9A-Za-z_-]+/g, "[redacted-api-key]")
                .slice(0, 300);
              finish(
                new Error(
                  `Gemini Live connection closed before completion (${event.code}${reason ? `: ${reason}` : ""}).`,
                ),
              );
            }
          },
        },
      })
      .then((connectedSession) => {
        session = connectedSession;
        connectedSession.sendRealtimeInput({ text: prompt });
      })
      .catch((error: unknown) => {
        finish(
          error instanceof Error
            ? error
            : new Error("Gemini Live connection failed."),
        );
      });
  });
}
