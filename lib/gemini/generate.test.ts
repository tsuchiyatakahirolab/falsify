import type { GenerateContentResponse } from "@google/genai";
import { describe, expect, it } from "vitest";

import { extractGeminiGrounding } from "./generate";

describe("Gemini grounding provenance", () => {
  it("keeps only HTTP sources and remaps support indices after deduplication", () => {
    const response = {
      candidates: [
        {
          groundingMetadata: {
            searchEntryPoint: {
              renderedContent: "<div>Google Search suggestions</div>",
            },
            groundingChunks: [
              {
                web: {
                  title: "Official source",
                  uri: "https://example.gov/a#table",
                },
              },
              { web: { title: "Duplicate", uri: "https://example.gov/a" } },
              { web: { title: "Unsafe", uri: "javascript:alert(1)" } },
            ],
            groundingSupports: [
              {
                segment: { text: "[claim-1] Grounded statement." },
                groundingChunkIndices: [0, 1, 2],
              },
            ],
          },
        },
      ],
    } as GenerateContentResponse;

    expect(extractGeminiGrounding(response)).toEqual({
      sources: [{ title: "Official source", url: "https://example.gov/a" }],
      supports: [
        {
          text: "[claim-1] Grounded statement.",
          sourceIndexes: [0],
        },
      ],
      searchSuggestionHtml: "<div>Google Search suggestions</div>",
    });
  });
});
