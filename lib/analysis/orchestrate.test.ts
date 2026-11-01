import { afterEach, describe, expect, it, vi } from "vitest";

import { AnalysisResultSchema } from "@/lib/domain/schemas";

import { analyzeInput } from "./orchestrate";

describe("analysis orchestration", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("reports the selected subset without implying complete coverage", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.stubEnv("ANALYSIS_MAX_CLAIMS", "2");
    const result = await analyzeInput({
      type: "text",
      content:
        "消費電力が20%減少した。導入費用は100万円だった。設備の稼働時間は1日8時間だった。",
      title: null,
      source_url: null,
      file_name: null,
      mime_type: null,
    });
    expect(result.claims).toHaveLength(2);
    expect(result.coverage).toEqual({
      scope: "selected_claims",
      analyzed_claims: 2,
      extracted_claims: 3,
      analysis_limit: 2,
      extraction_limit: 8,
    });
    expect(result.findings.map((finding) => finding.claim_id)).toEqual(
      result.claims.map((claim) => claim.id),
    );
    expect(result.evidence).toEqual([]);
  });

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
