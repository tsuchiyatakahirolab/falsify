import { describe, expect, it } from "vitest";

import { AnalysisResultSchema } from "@/lib/domain/schemas";

import { analyzeInput } from "./orchestrate";

describe("analysis orchestration", () => {
  it("returns a valid, explicit partial result without an API key", async () => {
    const previousOpenAI = process.env.OPENAI_API_KEY;
    const previousGemini = process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    try {
      const result = await analyzeInput({
        type: "text",
        content:
          "The cited observational study proves that the policy caused a 20% decline.",
        title: null,
        source_url: null,
        file_name: null,
        mime_type: null,
      });
      expect(AnalysisResultSchema.safeParse(result).success).toBe(true);
      expect(result.mode).toBe("sample");
      expect(result.evidence).toEqual([]);
      expect(result.limitations.join(" ")).toContain(
        "No sources were invented",
      );
      expect(result.findings[0].verdict).toBe("INSUFFICIENT_EVIDENCE");
    } finally {
      if (previousOpenAI) process.env.OPENAI_API_KEY = previousOpenAI;
      if (previousGemini) process.env.GEMINI_API_KEY = previousGemini;
    }
  });
});
