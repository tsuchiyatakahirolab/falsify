import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { ClaimSchema } from "@/lib/domain/schemas";

import { decomposeClaimsLocally } from "./decompose";

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
});
