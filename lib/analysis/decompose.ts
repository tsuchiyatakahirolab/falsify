import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import {
  CLAIM_TYPES,
  ClaimSchema,
  TESTABILITY_VALUES,
  type Claim,
} from "@/lib/domain/schemas";
import { getLiveProvider } from "@/lib/ai/provider";
import { GEMINI_MODEL } from "@/lib/gemini/client";
import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai/client";

import { DECOMPOSITION_PROMPT, UNTRUSTED_CONTENT_POLICY } from "./prompts";

const ModelClaimSchema = z
  .object({
    id: z.string(),
    original_text: z.string(),
    normalized_claim: z.string(),
    claim_type: z.enum(CLAIM_TYPES),
    testability: z.enum(TESTABILITY_VALUES),
    evidence_requirements: z.array(z.string()),
    falsification_questions: z.array(z.string()).min(1),
    time_sensitive: z.boolean(),
    entities: z.array(z.string()),
    source_span: z
      .object({ start: z.number().int(), end: z.number().int() })
      .nullable(),
  })
  .strict();

const DecompositionOutputSchema = z
  .object({
    claims: z.array(ModelClaimSchema).min(1).max(8),
  })
  .strict();

export interface DecompositionResult {
  claims: Claim[];
  model: string;
  mode: "live" | "sample";
  limitations: string[];
}

function claimTypeFor(text: string): Claim["claim_type"] {
  const value = text.toLowerCase();
  if (/\b(should|ought|must be|unacceptable|justified)\b/.test(value)) {
    return "normative";
  }
  if (
    /\b(pre-?war|historical|return to|revival|again becoming)\b/.test(value)
  ) {
    return "historical_analogy";
  }
  if (/\b(intent|intends|secret|deliberately|deceiv|aims? to)\b/.test(value)) {
    return "attribution_intent";
  }
  if (
    /\b(caused?|causes?|proves?|leads? to|resulted? in|because)\b/.test(value)
  ) {
    return "causal";
  }
  if (/\b(currently|latest|today|now|as of)\b/.test(value)) {
    return "temporal";
  }
  if (
    /\b\d+(?:\.\d+)?\s*(?:%|percent|fold|billion|million|trillion)?\b/.test(
      value,
    )
  ) {
    return "quantitative";
  }
  if (
    /\b(more|less|higher|lower|largest|smallest|compared|than)\b/.test(value)
  ) {
    return "comparative";
  }
  if (/\b(will|forecast|expected to|likely to)\b/.test(value)) {
    return "prediction";
  }
  if (/\b(suggests|means|indicates|represents)\b/.test(value)) {
    return "interpretation";
  }
  return "factual";
}

function testabilityFor(type: Claim["claim_type"]): Claim["testability"] {
  if (type === "normative") return "not_empirically_falsifiable";
  if (
    type === "historical_analogy" ||
    type === "interpretation" ||
    type === "prediction"
  ) {
    return "partially_testable";
  }
  return "empirically_testable";
}

function questionFor(type: Claim["claim_type"], text: string): string {
  const subject = text.length > 120 ? `${text.slice(0, 117)}…` : text;
  const questions: Record<Claim["claim_type"], string> = {
    factual: `What reliable primary evidence would show that “${subject}” did not occur as stated?`,
    quantitative:
      "Do comparable source figures, units, baselines, and calculations produce a materially different number?",
    temporal:
      "Does newer authoritative evidence show that the time-sensitive status has changed?",
    comparative:
      "Does a like-for-like comparison using the same period and denominator reverse or narrow the claim?",
    causal:
      "Could the evidence establish association rather than causation, or support a plausible alternative cause?",
    attribution_intent:
      "Is there direct or credible circumstantial evidence of intent, rather than an inference from outcomes alone?",
    prediction:
      "Which observable outcome and time horizon would count against this prediction?",
    historical_analogy:
      "Are the analogy’s defining historical features absent, materially different, or explained by a narrower account?",
    interpretation:
      "What credible alternative interpretation fits the same evidence with fewer unsupported assumptions?",
    normative:
      "Which factual premises can be tested separately, and which value judgment remains outside empirical verification?",
  };
  return questions[type];
}

function sentenceSpans(
  text: string,
): Array<{ text: string; start: number; end: number }> {
  const matches = text.matchAll(/[^.!?\n]+(?:[.!?]+|$)/g);
  return [...matches]
    .map((match) => {
      const raw = match[0];
      const leading = raw.length - raw.trimStart().length;
      const value = raw.trim();
      const start = (match.index ?? 0) + leading;
      return { text: value, start, end: start + value.length };
    })
    .filter((item) => item.text.length >= 8)
    .slice(0, 8);
}

export function decomposeClaimsLocally(text: string): DecompositionResult {
  const spans = sentenceSpans(text);
  const candidates = spans.length
    ? spans
    : [{ text: text.trim(), start: 0, end: text.trim().length }];

  const claims = candidates.map((item, index) => {
    const claim_type = claimTypeFor(item.text);
    return ClaimSchema.parse({
      id: `claim-${index + 1}`,
      original_text: item.text,
      normalized_claim: item.text.replace(/[.!?]+$/, "").trim(),
      claim_type,
      testability: testabilityFor(claim_type),
      evidence_requirements: [
        claim_type === "normative"
          ? "Explicit value premise and separately testable factual premises"
          : "Relevant primary or authoritative evidence that directly addresses the proposition",
      ],
      falsification_questions: [questionFor(claim_type, item.text)],
      time_sensitive:
        claim_type === "temporal" ||
        /\b(202\d|current|latest|today)\b/i.test(item.text),
      entities: [],
      source_span: { start: item.start, end: item.end },
    });
  });

  return {
    claims,
    model: "deterministic-fallback",
    mode: "sample",
    limitations: [
      "No supported server-side model key is configured, so claim decomposition used a deterministic fallback and no live evidence search was performed.",
    ],
  };
}

function normalizeModelClaims(
  text: string,
  parsed: z.infer<typeof DecompositionOutputSchema>,
): Claim[] {
  return parsed.claims.map((raw, index) => {
    const fallbackStart = text.indexOf(raw.original_text);
    const span = raw.source_span;
    const validSpan =
      span &&
      span.start >= 0 &&
      span.end >= span.start &&
      span.end <= text.length
        ? span
        : fallbackStart >= 0
          ? {
              start: fallbackStart,
              end: fallbackStart + raw.original_text.length,
            }
          : null;

    return ClaimSchema.parse({
      ...raw,
      id: `claim-${index + 1}`,
      evidence_requirements: raw.evidence_requirements.filter(Boolean),
      entities: raw.entities.filter(Boolean),
      source_span: validSpan,
    });
  });
}

export async function decomposeClaims(
  text: string,
): Promise<DecompositionResult> {
  const provider = getLiveProvider();
  if (!provider) return decomposeClaimsLocally(text);

  if (provider === "gemini") {
    const decomposition = decomposeClaimsLocally(text);
    return {
      ...decomposition,
      model: GEMINI_MODEL,
      mode: "live",
      limitations: [
        "To conserve the public Gemini free-tier quota, claim decomposition and final auditing are deterministic; Gemini is reserved for two independent grounded evidence searches.",
      ],
    };
  }

  const client = getOpenAIClient();
  const response = await client.responses.parse({
    model: OPENAI_MODEL,
    max_output_tokens: 6_000,
    reasoning: { effort: "medium" },
    input: [
      {
        role: "system",
        content: `${UNTRUSTED_CONTENT_POLICY}\n${DECOMPOSITION_PROMPT}`,
      },
      {
        role: "user",
        content: `<untrusted_submission>\n${text}\n</untrusted_submission>`,
      },
    ],
    text: {
      format: zodTextFormat(DecompositionOutputSchema, "claim_decomposition"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("GPT-5.6 returned no structured claim decomposition.");
  }

  return {
    claims: normalizeModelClaims(text, response.output_parsed),
    model: OPENAI_MODEL,
    mode: "live",
    limitations: [],
  };
}
