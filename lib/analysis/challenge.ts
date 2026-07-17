import {
  ChallengeResultSchema,
  FindingSchema,
  type AnalysisResult,
  type ChallengeResult,
} from "@/lib/domain/schemas";
import {
  challengeFlagshipFinding,
  FLAGSHIP_DEMO_ID,
} from "@/lib/demo/flagship";

import { synthesizeFindings } from "./audit";
import { retrieveAdversarialRecheck } from "./evidence";

export async function challengeFinding(
  analysis: AnalysisResult,
  claimId: string,
): Promise<ChallengeResult> {
  if (analysis.id === FLAGSHIP_DEMO_ID) {
    const demoChallenge = challengeFlagshipFinding(claimId);
    if (demoChallenge) return demoChallenge;
  }
  const claim = analysis.claims.find((item) => item.id === claimId);
  const original = analysis.findings.find((item) => item.claim_id === claimId);
  if (!claim || !original) {
    throw new Error(
      "The requested claim or finding does not exist in this analysis.",
    );
  }

  const recheck = await retrieveAdversarialRecheck(claim, original);
  if (!recheck.evidence.length) {
    return ChallengeResultSchema.parse({
      claim_id: claimId,
      challenged_at: new Date().toISOString(),
      outcome: "unresolved",
      original_finding: original,
      revised_finding: FindingSchema.parse({
        ...original,
        unresolved: [
          ...new Set([
            ...original.unresolved,
            ...recheck.limitations,
            "No new allowlisted counter-evidence was available for this re-check.",
          ]),
        ],
      }),
      new_evidence: [],
      explanation:
        "The initial finding could not be independently stress-tested because no new allowlisted counter-evidence was available. It is not treated as confirmed.",
    });
  }

  const existing = analysis.evidence.filter(
    (item) => item.claim_id === claimId,
  );
  const synthesis = await synthesizeFindings(
    analysis.input,
    [claim],
    [...existing, ...recheck.evidence],
  );
  const revised = synthesis.findings[0];
  const changed = revised.verdict !== original.verdict;
  const qualified =
    !changed &&
    (revised.analysis !== original.analysis ||
      revised.issue_labels.join() !== original.issue_labels.join());

  return ChallengeResultSchema.parse({
    claim_id: claimId,
    challenged_at: new Date().toISOString(),
    outcome: changed ? "changed" : qualified ? "qualified" : "holds",
    original_finding: original,
    revised_finding: revised,
    new_evidence: recheck.evidence,
    explanation: changed
      ? "New counter-evidence changed the qualified verdict. Inspect the revised finding and sources below."
      : qualified
        ? "New counter-evidence narrowed or qualified the reasoning while the verdict label remained stable."
        : "The finding held after a separate search for evidence that could weaken it; remaining uncertainty is still shown.",
  });
}
