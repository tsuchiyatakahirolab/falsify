import { describe, expect, it } from "vitest";

import { flagshipAnalysis } from "../demo/flagship";
import { challengeFinding } from "./challenge";
import { analyzeInput } from "./orchestrate";

describe("challenge this finding", () => {
  it("keeps an untested finding unresolved when no new evidence is available", async () => {
    const previous = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    try {
      const analysis = await analyzeInput({
        type: "text",
        content: "A current claim relies on a 2019 ranking.",
        title: null,
        source_url: null,
        file_name: null,
        mime_type: null,
      });
      const challenge = await challengeFinding(analysis, analysis.claims[0].id);
      expect(challenge.outcome).toBe("unresolved");
      expect(challenge.original_finding).toEqual(analysis.findings[0]);
      expect(challenge.revised_finding.unresolved.join(" ")).toContain(
        "No new allowlisted counter-evidence",
      );
    } finally {
      if (previous) process.env.OPENAI_API_KEY = previous;
    }
  });

  it("does not trust a mutated client bundle with the flagship ID", async () => {
    const mutated = structuredClone(flagshipAnalysis);
    mutated.findings[1].analysis = "Client-controlled replacement.";
    await expect(challengeFinding(mutated, "claim-2")).rejects.toMatchObject({
      name: "ChallengeInputError",
    });
  });
});
