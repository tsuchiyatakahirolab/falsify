import { readFileSync } from "node:fs";
import { join } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ISSUE_LABELS } from "@/lib/domain/schemas";

import { decomposeClaimsLocally } from "./decompose";
import { auditClaimsDeterministically, synthesizeFindings } from "./audit";

const previousKeys = {
  provider: process.env.AI_PROVIDER,
  openai: process.env.OPENAI_API_KEY,
  gemini: process.env.GEMINI_API_KEY,
};

beforeAll(() => {
  process.env.AI_PROVIDER = "openai";
  delete process.env.OPENAI_API_KEY;
  delete process.env.GEMINI_API_KEY;
});

afterAll(() => {
  if (previousKeys.provider === undefined) delete process.env.AI_PROVIDER;
  else process.env.AI_PROVIDER = previousKeys.provider;
  if (previousKeys.openai === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = previousKeys.openai;
  if (previousKeys.gemini === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = previousKeys.gemini;
});

interface GoldenCase {
  id: string;
  input: string;
  expected_primary_issue: (typeof ISSUE_LABELS)[number] | null;
  expected_verdict?: string;
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

describe("deterministic audit engine", () => {
  it("matches the intended issue or verdict for every golden case", async () => {
    for (const golden of goldenCases()) {
      const decomposition = decomposeClaimsLocally(golden.input);
      const audits = auditClaimsDeterministically(decomposition.claims);
      const issues = new Set(audits.flatMap((audit) => audit.issue_labels));
      if (golden.expected_primary_issue) {
        expect(issues.has(golden.expected_primary_issue), golden.id).toBe(true);
      }
      if (golden.expected_verdict) {
        const result = await synthesizeFindings(
          {
            type: "text",
            content: golden.input,
            title: null,
            source_url: null,
            file_name: null,
            mime_type: null,
          },
          decomposition.claims,
          [],
        );
        expect(result.findings[0].verdict, golden.id).toBe(
          golden.expected_verdict,
        );
      }
    }
  });

  it("does not call a supported association false when causation overreaches", async () => {
    const input = {
      type: "text" as const,
      content:
        "A report says a policy caused a 20% reduction. Its study reports only an observational association.",
      title: null,
      source_url: null,
      file_name: null,
      mime_type: null,
    };
    const claims = decomposeClaimsLocally(input.content).claims;
    const result = await synthesizeFindings(input, claims, []);
    expect(result.findings[0].issue_labels).toContain("CAUSAL_OVERREACH");
    expect(result.findings[0].issue_labels).not.toContain(
      "FALSE_FACTUAL_CLAIM",
    );
  });

  it("does not leak an analogy label into an adjacent factual claim", () => {
    const input =
      "Japan's FY2026 draft defense budget proposal reached a record high. This alone proves a revival of pre-war militarism.";
    const claims = decomposeClaimsLocally(input).claims;
    const audits = auditClaimsDeterministically(claims);
    expect(audits[0].issue_labels).not.toContain(
      "HISTORICAL_ANALOGY_NOT_ESTABLISHED",
    );
    expect(audits[1].issue_labels).toContain(
      "HISTORICAL_ANALOGY_NOT_ESTABLISHED",
    );
  });
});
