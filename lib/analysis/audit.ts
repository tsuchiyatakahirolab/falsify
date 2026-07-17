import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import {
  AuditObservationSchema,
  FindingSchema,
  type AuditObservation,
  type Claim,
  type Evidence,
  type Finding,
  type FalsifyInput,
} from "@/lib/domain/schemas";
import { getLiveProvider } from "@/lib/ai/provider";
import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai/client";

import { FINDING_SYNTHESIS_PROMPT, UNTRUSTED_CONTENT_POLICY } from "./prompts";

const FindingBundleSchema = z
  .object({ findings: z.array(FindingSchema).max(8) })
  .strict();

export interface AuditResult {
  audits: AuditObservation[];
  findings: Finding[];
  limitations: string[];
}

function issueLabelsFor(text: string, claim: Claim): Finding["issue_labels"] {
  const value = text.toLowerCase();
  const labels = new Set<Finding["issue_labels"][number]>();

  if (
    claim.claim_type === "causal" &&
    /\b(observational|association|correlation|alone|caused?|proves?)\b/.test(
      value,
    )
  ) {
    labels.add("CAUSAL_OVERREACH");
  }
  if (
    claim.claim_type === "historical_analogy" ||
    /\b(pre-?war|historical analogy|revival of .*ideology)\b/.test(value)
  ) {
    labels.add("HISTORICAL_ANALOGY_NOT_ESTABLISHED");
  }
  if (
    claim.claim_type === "attribution_intent" ||
    (/\b(intent|secret|deliberately|deceiv)\b/.test(value) &&
      /\b(no .*evidence|without .*evidence|provides no)\b/.test(value))
  ) {
    labels.add("ATTRIBUTION_NOT_ESTABLISHED");
  }
  if (
    /\bdoes not contain evidence|does not support|only .*same topic\b/.test(
      value,
    )
  ) {
    labels.add("UNSUPPORTED");
  }
  if (
    /\b(selective|does not apply the same|comparable or higher|omits? comparison)\b/.test(
      value,
    )
  ) {
    labels.add("SELECTIVE_CONTEXT");
  }

  const years = [...value.matchAll(/\b(19\d{2}|20\d{2})\b/g)].map((match) =>
    Number(match[1]),
  );
  if (
    /\b(currently|current|latest|today|now)\b/.test(value) &&
    years.length >= 2
  ) {
    const newest = Math.max(...years);
    const oldest = Math.min(...years);
    if (newest - oldest >= 2) labels.add("OUTDATED");
  }

  if (/\btenfold|10[- ]?fold\b/.test(value)) {
    const range = value.match(
      /\bfrom\s+(\d+(?:\.\d+)?)\s+to\s+(\d+(?:\.\d+)?)/,
    );
    if (range && Number(range[2]) / Number(range[1]) < 9.5) {
      labels.add("NUMERICAL_MISMATCH");
    }
  }

  if (
    /\b(alone|therefore|thus|proves?|establishes?)\b/.test(value) &&
    (claim.claim_type === "causal" ||
      claim.claim_type === "historical_analogy" ||
      claim.claim_type === "attribution_intent")
  ) {
    labels.add("INFERENCE_EXCEEDS_EVIDENCE");
  }

  return [...labels];
}

function checkForLabel(
  label: Finding["issue_labels"][number],
  text: string,
): AuditObservation["checks"][number] {
  const types: Record<
    Finding["issue_labels"][number],
    AuditObservation["checks"][number]["type"]
  > = {
    FALSE_FACTUAL_CLAIM: "inference",
    MISLEADING: "context",
    UNSUPPORTED: "metadata",
    SELECTIVE_CONTEXT: "context",
    OUTDATED: "date",
    NUMERICAL_MISMATCH: "number",
    CAUSAL_OVERREACH: "inference",
    ATTRIBUTION_NOT_ESTABLISHED: "attribution",
    HISTORICAL_ANALOGY_NOT_ESTABLISHED: "analogy",
    CATEGORY_SHIFT: "inference",
    INFERENCE_EXCEEDS_EVIDENCE: "inference",
  };
  const explanations: Partial<Record<Finding["issue_labels"][number], string>> =
    {
      OUTDATED:
        "A current-status claim relies on an older dated reference while newer timing appears in the input.",
      NUMERICAL_MISMATCH:
        "The stated tenfold change is inconsistent with the supplied start and end values.",
      CAUSAL_OVERREACH:
        "The wording moves from association or a single premise to causation without an identified causal design.",
      ATTRIBUTION_NOT_ESTABLISHED:
        "Intent is attributed without identified direct or circumstantial evidence of intent.",
      HISTORICAL_ANALOGY_NOT_ESTABLISHED:
        "A factual development does not by itself establish the defining features of the historical analogy.",
      SELECTIVE_CONTEXT:
        "The comparison may omit relevant like-for-like cases or apply its criterion asymmetrically.",
      UNSUPPORTED:
        "The described source is relevant to the topic but does not directly support the specific proposition.",
      INFERENCE_EXCEEDS_EVIDENCE:
        "The conclusion is stronger than the stated evidentiary premise independently establishes.",
    };
  return {
    type: types[label],
    status: "flag",
    explanation: explanations[label] ?? `Deterministic audit flagged ${label}.`,
    observed: text.length > 180 ? `${text.slice(0, 177)}…` : text,
    expected: null,
  };
}

export function auditClaimsDeterministically(
  claims: Claim[],
): AuditObservation[] {
  return claims.map((claim) => {
    const text = `${claim.original_text} ${claim.normalized_claim}`;
    const issue_labels = issueLabelsFor(text, claim);
    return AuditObservationSchema.parse({
      claim_id: claim.id,
      issue_labels,
      checks: issue_labels.length
        ? issue_labels.map((label) => checkForLabel(label, text))
        : [
            {
              type: "inference",
              status: "not_applicable",
              explanation:
                "No deterministic date, number, attribution, analogy, context, or inference rule fired.",
              observed: null,
              expected: null,
            },
          ],
    });
  });
}

function localFinding(
  claim: Claim,
  evidence: Evidence[],
  audit: AuditObservation,
): Finding {
  const support = evidence.filter(
    (item) => item.claim_id === claim.id && item.stance === "supporting",
  );
  const challenge = evidence.filter(
    (item) =>
      item.claim_id === claim.id &&
      (item.stance === "contradicting" || item.stance === "qualifying"),
  );
  const legitimateCriticism =
    /\b(criticism accurately|factual criticism remains valid|documented policy change)\b/i.test(
      `${claim.original_text} ${claim.normalized_claim}`,
    );

  let verdict: Finding["verdict"];
  if (legitimateCriticism) verdict = "LEGITIMATE_CRITICISM";
  else if (claim.testability === "not_empirically_falsifiable")
    verdict = "NOT_VERIFIABLE";
  else if (support.length && challenge.length) verdict = "PARTIALLY_SUPPORTED";
  else if (support.length && !audit.issue_labels.length) verdict = "SUPPORTED";
  else if (support.length) verdict = "PARTIALLY_SUPPORTED";
  else if (challenge.some((item) => item.stance === "contradicting"))
    verdict = "CONTRADICTED";
  else verdict = "INSUFFICIENT_EVIDENCE";

  return FindingSchema.parse({
    claim_id: claim.id,
    verdict,
    issue_labels: audit.issue_labels,
    factual_core: support.length
      ? "The supporting sources establish at least part of the proposition."
      : "No factual core has been independently established in the available evidence set.",
    analysis: audit.issue_labels.length
      ? audit.checks
          .filter((check) => check.status === "flag")
          .map((check) => check.explanation)
          .join(" ")
      : "The available evidence does not support a stronger conclusion than the qualified verdict shown.",
    unresolved: evidence.some((item) => item.claim_id === claim.id)
      ? []
      : ["No allowlisted public source was available for this claim."],
    supporting_evidence_ids: support.map((item) => item.id),
    challenging_evidence_ids: challenge.map((item) => item.id),
    human_judgment_required:
      claim.testability !== "empirically_testable" ||
      (support.length > 0 && challenge.length > 0),
  });
}

function mergeDeterministicAudits(
  modelFinding: Finding,
  audit: AuditObservation,
  evidence: Evidence[],
): Finding {
  const evidenceById = new Map(evidence.map((item) => [item.id, item]));
  return FindingSchema.parse({
    ...modelFinding,
    issue_labels: [
      ...new Set([...modelFinding.issue_labels, ...audit.issue_labels]),
    ],
    supporting_evidence_ids: modelFinding.supporting_evidence_ids.filter(
      (id) => {
        const item = evidenceById.get(id);
        return (
          item?.stance === "supporting" ||
          (item?.stance === "contextual" &&
            !item.id.startsWith("challenge-evidence-"))
        );
      },
    ),
    challenging_evidence_ids: modelFinding.challenging_evidence_ids.filter(
      (id) => {
        const item = evidenceById.get(id);
        return (
          item?.stance === "contradicting" ||
          item?.stance === "qualifying" ||
          (item?.stance === "contextual" &&
            item.id.startsWith("challenge-evidence-"))
        );
      },
    ),
  });
}

export async function synthesizeFindings(
  input: FalsifyInput,
  claims: Claim[],
  evidence: Evidence[],
): Promise<AuditResult> {
  const audits = auditClaimsDeterministically(claims);
  const local = claims.map((claim) =>
    localFinding(
      claim,
      evidence,
      audits.find((audit) => audit.claim_id === claim.id)!,
    ),
  );

  const provider = getLiveProvider();
  if (!provider) {
    return { audits, findings: local, limitations: [] };
  }

  if (provider === "gemini") {
    return {
      audits,
      findings: local,
      limitations: [
        "Findings were synthesized by deterministic audit rules over Gemini-grounded sources to conserve the public free-tier quota.",
      ],
    };
  }

  const response = await getOpenAIClient().responses.parse({
    model: OPENAI_MODEL,
    max_output_tokens: 6_000,
    reasoning: { effort: "medium" },
    input: [
      {
        role: "system",
        content: `${UNTRUSTED_CONTENT_POLICY}\n${FINDING_SYNTHESIS_PROMPT}`,
      },
      {
        role: "user",
        content: `<untrusted_analysis_bundle>\n${JSON.stringify({
          input,
          claims,
          evidence,
          audits,
        })}\n</untrusted_analysis_bundle>`,
      },
    ],
    text: {
      format: zodTextFormat(FindingBundleSchema, "claim_findings"),
    },
  });

  if (!response.output_parsed) {
    return {
      audits,
      findings: local,
      limitations: [
        "GPT-5.6 synthesis returned no structured output; deterministic findings are shown.",
      ],
    };
  }

  const claimIds = new Set(claims.map((claim) => claim.id));
  const modelByClaim = new Map(
    response.output_parsed.findings
      .filter((finding) => claimIds.has(finding.claim_id))
      .map((finding) => [finding.claim_id, finding]),
  );
  const findings = claims.map((claim, index) => {
    const modelFinding = modelByClaim.get(claim.id);
    return modelFinding
      ? mergeDeterministicAudits(modelFinding, audits[index], evidence)
      : local[index];
  });

  return { audits, findings, limitations: [] };
}
