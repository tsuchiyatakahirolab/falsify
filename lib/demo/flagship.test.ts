import { describe, expect, it } from "vitest";

import { AnalysisResultSchema } from "@/lib/domain/schemas";

import { challengeFlagshipFinding, flagshipAnalysis } from "./flagship";

describe("flagship China-to-Japan narrative demo", () => {
  it("is a valid public-source analysis with symmetric intent standards", () => {
    expect(AnalysisResultSchema.safeParse(flagshipAnalysis).success).toBe(true);
    expect(
      flagshipAnalysis.evidence.every((item) =>
        item.url.startsWith("https://"),
      ),
    ).toBe(true);
    expect(flagshipAnalysis.findings[2].issue_labels).toContain(
      "ATTRIBUTION_NOT_ESTABLISHED",
    );
    expect(flagshipAnalysis.findings[3].issue_labels).toContain(
      "ATTRIBUTION_NOT_ESTABLISHED",
    );
    expect(flagshipAnalysis).not.toHaveProperty("credibility_score");
    expect(flagshipAnalysis.claims[0].normalized_claim).toContain(
      "draft defense budget proposal",
    );
    expect(flagshipAnalysis.findings[0].analysis).toContain(
      "do not show final Diet enactment",
    );
    for (const claim of flagshipAnalysis.claims) {
      expect(
        flagshipAnalysis.input.content.slice(
          claim.source_span!.start,
          claim.source_span!.end,
        ),
      ).toBe(claim.original_text);
    }
    for (const finding of flagshipAnalysis.findings) {
      const supportStances = flagshipAnalysis.evidence
        .filter((item) => finding.supporting_evidence_ids.includes(item.id))
        .map((item) => item.stance);
      const challengeStances = flagshipAnalysis.evidence
        .filter((item) => finding.challenging_evidence_ids.includes(item.id))
        .map((item) => item.stance);
      expect(
        supportStances.every(
          (stance) => stance === "supporting" || stance === "contextual",
        ),
      ).toBe(true);
      expect(
        challengeStances.every(
          (stance) => stance === "contradicting" || stance === "qualifying",
        ),
      ).toBe(true);
    }
  });

  it("qualifies Falsify's own finding with new domestic counter-evidence", () => {
    const challenge = challengeFlagshipFinding("claim-2");
    expect(challenge?.outcome).toBe("qualified");
    expect(challenge?.new_evidence).toHaveLength(1);
    expect(challenge?.revised_finding.analysis).toContain(
      "parliamentary material",
    );
    expect(challenge?.revised_finding.verdict).toBe(
      challenge?.original_finding.verdict,
    );
  });
});
