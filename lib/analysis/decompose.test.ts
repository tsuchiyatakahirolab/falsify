import { readFileSync } from "node:fs";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { ClaimSchema } from "@/lib/domain/schemas";
import * as provider from "@/lib/ai/provider";
import * as openai from "@/lib/openai/client";

import { decomposeClaims, decomposeClaimsLocally } from "./decompose";

interface GoldenCase {
  id: string;
  input: string;
}

function goldenCases(): GoldenCase[] {
  return readFileSync(
    join(process.cwd(), "evals", "golden_cases.jsonl"),
    "utf8",
  )
    .trim()
    .split(/\r?\n/)
    .map((line) => JSON.parse(line) as GoldenCase);
}

describe("claim decomposition", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("produces structurally valid falsifiable claims for every golden case", () => {
    for (const golden of goldenCases()) {
      const result = decomposeClaimsLocally(golden.input);
      expect(result.claims.length, golden.id).toBeGreaterThan(0);
      for (const claim of result.claims) {
        expect(ClaimSchema.safeParse(claim).success, golden.id).toBe(true);
        expect(claim.falsification_questions.length, golden.id).toBeGreaterThan(
          0,
        );
      }
    }
  });

  it("does not present normative statements as empirical facts", () => {
    const result = decomposeClaimsLocally(
      "Governments should never increase defense expenditure.",
    );
    expect(result.claims[0]).toMatchObject({
      claim_type: "normative",
      testability: "not_empirically_falsifiable",
    });
  });

  it("separates sentence-level premises and inferential claims", () => {
    const result = decomposeClaimsLocally(
      "The official budget increased by 12%. This alone proves a revival of pre-war ideology.",
    );
    expect(result.claims).toHaveLength(2);
    expect(result.claims[0].claim_type).toBe("quantitative");
    expect(result.claims[1].claim_type).toBe("historical_analogy");
  });

  it("retains short Japanese sentences and exact source spans across whitespace", () => {
    const input =
      "  報告がある。\n\n　増加した！  減少した？\r\n末尾の記述です";
    const result = decomposeClaimsLocally(input);
    expect(result.claims.map((claim) => claim.original_text)).toEqual([
      "報告がある。",
      "増加した！",
      "減少した？",
      "末尾の記述です",
    ]);
    for (const claim of result.claims) {
      expect(claim.source_span).not.toBeNull();
      const { start, end } = claim.source_span!;
      expect(input.slice(start, end)).toBe(claim.original_text);
    }
    expect(result.claims[0].source_span?.start).toBe(2);
    expect(result.claims[0].normalized_claim).toBe("報告がある");
  });

  it("keeps decimals, URL queries, and common English abbreviations intact", () => {
    const sentences = [
      "Dr. A. Smith reports a 3.5% increase.",
      "See https://example.org/data.v1?year=2026&ratio=1.5.",
      "The U.S. Department published the figures.",
    ];
    const input = sentences.join(" ");
    const result = decomposeClaimsLocally(input);
    expect(result.claims.map((claim) => claim.original_text)).toEqual(
      sentences,
    );
    for (const claim of result.claims) {
      const { start, end } = claim.source_span!;
      expect(input.slice(start, end)).toBe(claim.original_text);
    }
  });

  it("keeps a Japanese quotation with its reporting clause", () => {
    const input = "同省は「支出は増えた。」と述べた。次の論点を検討する。";
    const result = decomposeClaimsLocally(input);
    expect(result.claims.map((claim) => claim.original_text)).toEqual([
      "同省は「支出は増えた。」と述べた。",
      "次の論点を検討する。",
    ]);
  });

  it("retains a sentence boundary after an acronym followed by a new subject", () => {
    const result = decomposeClaimsLocally(
      "The team works in the U.S. They published the report.",
    );
    expect(result.claims.map((claim) => claim.original_text)).toEqual([
      "The team works in the U.S.",
      "They published the report.",
    ]);
  });

  it("preserves UTF-16 offsets after emoji and respects the eight-candidate bound", () => {
    const sentences = Array.from(
      { length: 10 },
      (_, index) => `検証対象${index + 1}を示す。`,
    );
    const input = `🔎 ${sentences.join("")}`;
    const result = decomposeClaimsLocally(input);
    expect(result.claims).toHaveLength(8);
    expect(result.claims[7].original_text).toBe(sentences[7]);
    for (const claim of result.claims) {
      const { start, end } = claim.source_span!;
      expect(input.slice(start, end)).toBe(claim.original_text);
    }
  });

  it.each([
    ["政府は根拠を公開すべきだ。", "normative"],
    ["政府は根拠を省略すべきではない。", "normative"],
    ["この政策は戦前への回帰である。", "historical_analogy"],
    ["政府は意図的に説明を省いた。", "attribution_intent"],
    ["新制度が雇用を増加させた。", "causal"],
    ["売上は2027年に増えると予想される。", "prediction"],
    ["現在、対象の事業は継続している。", "temporal"],
    ["対象地域の支出は比較地域より多い。", "comparative"],
    ["対象地域の支出は3.5兆円だ。", "quantitative"],
    ["この結果は制度の影響を示唆する。", "interpretation"],
    ["担当者は資料を公表した。", "factual"],
  ])("recognizes a bounded Japanese wording cue in %s", (input, type) => {
    const claim = decomposeClaimsLocally(input).claims[0];
    expect(claim.claim_type).toBe(type);
    expect(claim.falsification_questions[0]).toMatch(/[か。]$/);
    expect(claim.falsification_questions[0]).not.toMatch(/^What|^Does|^Is/);
    expect(claim.evidence_requirements[0]).toMatch(/[\p{Script=Hiragana}]/u);
  });

  it.each([
    "政府が誤導する意図を持っていない。",
    "意図的に説明を省いたとは断定できない。",
    "誤導する意図は確認されていない。",
    "この政策は戦前への回帰ではない。",
  ])(
    "does not turn qualified wording into a positive attribution: %s",
    (input) => {
      const result = decomposeClaimsLocally(input);
      expect(result.claims[0].original_text).toBe(input);
      expect(result.claims[0].claim_type).toBe("factual");
      expect(result.limitations.join(" ")).toContain("否定");
    },
  );

  it("marks Japanese value judgments as non-empirical and current claims as time-sensitive", () => {
    const result = decomposeClaimsLocally(
      "政府は説明を省略すべきではない。現在、対象の制度は存続している。",
    );
    expect(result.claims[0].testability).toBe("not_empirically_falsifiable");
    expect(result.claims[1].time_sensitive).toBe(true);
  });

  it("repairs model source spans only when the original wording can be located", async () => {
    const input = "First factual statement. Second factual statement.";
    const originalClaims = decomposeClaimsLocally(input).claims;
    const responseClaims = [
      { ...originalClaims[1], source_span: { start: 0, end: 24 } },
      {
        ...originalClaims[0],
        original_text: "A statement absent from the submission.",
        source_span: { start: 0, end: 24 },
      },
    ];
    const parse = vi.fn().mockResolvedValue({
      output_parsed: { claims: responseClaims },
    });
    vi.spyOn(provider, "getLiveProvider").mockReturnValue("openai");
    vi.spyOn(openai, "getOpenAIClient").mockReturnValue({
      responses: { parse },
    } as unknown as ReturnType<typeof openai.getOpenAIClient>);

    const result = await decomposeClaims(input);
    expect(result.claims[0].source_span).toEqual(originalClaims[1].source_span);
    expect(result.claims[1].source_span).toBeNull();
    expect(parse).toHaveBeenCalledOnce();
  });
});
