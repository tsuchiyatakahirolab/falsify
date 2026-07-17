import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const gemini = vi.hoisted(() => ({ searchGrounded: vi.fn() }));

vi.mock("@/lib/gemini/generate", () => ({
  searchGeminiGrounded: gemini.searchGrounded,
}));

import { AnalysisResultSchema } from "@/lib/domain/schemas";
import { GEMINI_MODEL } from "@/lib/gemini/client";

import { analyzeInput } from "./orchestrate";

const previous = {
  provider: process.env.AI_PROVIDER,
  openai: process.env.OPENAI_API_KEY,
  gemini: process.env.GEMINI_API_KEY,
};

beforeAll(() => {
  process.env.AI_PROVIDER = "gemini";
  process.env.GEMINI_API_KEY = "test-gemini-key";
  delete process.env.OPENAI_API_KEY;

  gemini.searchGrounded.mockImplementation(
    async (_prompt: string, systemInstruction: string) =>
      systemInstruction.includes("Support Investigator")
        ? {
            text: "[claim-1] The official table supports the narrower factual claim.",
            sources: [
              {
                title: "Official evidence table",
                url: "https://example.gov/support",
              },
            ],
            supports: [
              {
                text: "[claim-1] The official table supports the stated increase.",
                sourceIndexes: [0],
              },
            ],
            searchSuggestionHtml: "<div>Support search</div>",
          }
        : {
            text: "[claim-1] The review identifies a material qualification.",
            sources: [
              {
                title: "Independent qualifying review",
                url: "https://example.org/challenge",
              },
            ],
            supports: [
              {
                text: "[claim-1] The baseline choice materially qualifies the comparison.",
                sourceIndexes: [0],
              },
            ],
            searchSuggestionHtml: "<div>Challenge search</div>",
          },
  );
});

afterAll(() => {
  if (previous.provider === undefined) delete process.env.AI_PROVIDER;
  else process.env.AI_PROVIDER = previous.provider;
  if (previous.openai === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = previous.openai;
  if (previous.gemini === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = previous.gemini;
});

describe("Gemini live provider", () => {
  it("runs the two grounded evidence paths with deterministic audits", async () => {
    const result = await analyzeInput({
      type: "text",
      content: "The official table reports a 20% increase.",
      title: null,
      source_url: null,
      file_name: null,
      mime_type: null,
    });

    expect(AnalysisResultSchema.safeParse(result).success).toBe(true);
    expect(result).toMatchObject({ mode: "live", model: GEMINI_MODEL });
    expect(result.evidence).toHaveLength(2);
    expect(result.search_suggestions_html).toHaveLength(2);
    expect(result.evidence.map((item) => item.url)).toEqual([
      "https://example.gov/support",
      "https://example.org/challenge",
    ]);
    expect(result.findings[0].verdict).toBe("PARTIALLY_SUPPORTED");
    expect(result.limitations.join(" ")).toContain("free-tier quota");
  });
});
