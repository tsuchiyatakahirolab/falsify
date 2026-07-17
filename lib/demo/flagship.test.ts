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
