import { randomUUID } from "node:crypto";

import {
  AnalysisResultSchema,
  type AnalysisResult,
  type FalsifyInput,
} from "@/lib/domain/schemas";

import { synthesizeFindings } from "./audit";
import { decomposeClaims } from "./decompose";
import { retrieveEvidence } from "./evidence";

function maxClaims(): number {
  const configured = Number(process.env.ANALYSIS_MAX_CLAIMS ?? 5);
  return Number.isInteger(configured) && configured >= 1 && configured <= 8
    ? configured
    : 5;
}

export async function analyzeInput(
  input: FalsifyInput,
): Promise<AnalysisResult> {
  const decomposition = await decomposeClaims(input.content);
  const claims = decomposition.claims.slice(0, maxClaims());
  const retrieval = await retrieveEvidence(claims);
  const evidence = [...retrieval.supporting, ...retrieval.challenging];
  const audit = await synthesizeFindings(input, claims, evidence);

  return AnalysisResultSchema.parse({
    id: randomUUID(),
    generated_at: new Date().toISOString(),
    input,
    claims,
    evidence,
    findings: audit.findings,
    audits: audit.audits,
    limitations: [
      ...new Set([
        ...decomposition.limitations,
        ...retrieval.limitations,
        ...audit.limitations,
      ]),
    ],
    model:
      decomposition.mode === "live"
        ? decomposition.model
        : "deterministic-fallback",
    mode:
      decomposition.mode === "live" && retrieval.mode === "live"
        ? "live"
        : "sample",
  });
}
