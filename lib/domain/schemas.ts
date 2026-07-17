import { z } from "zod";

export const CLAIM_TYPES = [
  "factual",
  "quantitative",
  "temporal",
  "comparative",
  "causal",
  "attribution_intent",
  "prediction",
  "historical_analogy",
  "interpretation",
  "normative",
] as const;

export const TESTABILITY_VALUES = [
  "empirically_testable",
  "partially_testable",
  "not_empirically_falsifiable",
] as const;

export const VERDICTS = [
  "SUPPORTED",
  "PARTIALLY_SUPPORTED",
  "CONTRADICTED",
  "INSUFFICIENT_EVIDENCE",
  "SOURCE_MISMATCH",
  "NOT_VERIFIABLE",
  "CONTESTED_INTERPRETATION",
  "LEGITIMATE_CRITICISM",
] as const;

export const ISSUE_LABELS = [
  "FALSE_FACTUAL_CLAIM",
  "MISLEADING",
  "UNSUPPORTED",
  "SELECTIVE_CONTEXT",
  "OUTDATED",
  "NUMERICAL_MISMATCH",
  "CAUSAL_OVERREACH",
  "ATTRIBUTION_NOT_ESTABLISHED",
  "HISTORICAL_ANALOGY_NOT_ESTABLISHED",
  "CATEGORY_SHIFT",
  "INFERENCE_EXCEEDS_EVIDENCE",
] as const;

export const EVIDENCE_STANCES = [
  "supporting",
  "contradicting",
  "qualifying",
  "contextual",
] as const;

export const SOURCE_TYPES = [
  "primary_official",
  "primary_data",
  "primary_research",
  "secondary_scholarly",
  "secondary_journalistic",
  "other",
] as const;

export const SourceSpanSchema = z
  .object({
    start: z.number().int().nonnegative(),
    end: z.number().int().nonnegative(),
  })
  .strict()
  .refine(({ start, end }) => end >= start, {
    message: "Source span end must not precede its start.",
    path: ["end"],
  });

export const FalsificationQuestionSchema = z.string().min(1);

export const ClaimSchema = z
  .object({
    id: z.string().min(1),
    original_text: z.string().min(1),
    normalized_claim: z.string().min(1),
    claim_type: z.enum(CLAIM_TYPES),
    testability: z.enum(TESTABILITY_VALUES),
    evidence_requirements: z.array(z.string().min(1)),
    falsification_questions: z.array(FalsificationQuestionSchema).min(1),
    time_sensitive: z.boolean(),
    entities: z.array(z.string().min(1)),
    source_span: SourceSpanSchema.nullable(),
  })
  .strict();

const HttpUrlSchema = z
  .url()
  .refine((url) => url.startsWith("https://") || url.startsWith("http://"), {
    message: "Evidence URLs must use HTTP or HTTPS.",
  });

export const EvidenceSchema = z
  .object({
    id: z.string().min(1),
    claim_id: z.string().min(1),
    stance: z.enum(EVIDENCE_STANCES),
    title: z.string().min(1),
    url: HttpUrlSchema,
    publisher: z.string().min(1).nullable(),
    published_at: z.string().min(1).nullable(),
    source_type: z.enum(SOURCE_TYPES),
    excerpt: z.string().min(1).nullable(),
    relevance: z.enum(["direct", "indirect", "context_only"]),
    directness: z.enum([
      "directly_supports",
      "partially_supports",
      "does_not_directly_support",
      "unclear",
    ]),
    notes: z.string().min(1).nullable(),
  })
  .strict();

export const SourceProvenanceSchema = EvidenceSchema.pick({
  title: true,
  url: true,
  publisher: true,
  published_at: true,
  source_type: true,
  excerpt: true,
  relevance: true,
  directness: true,
});

export const FindingSchema = z
  .object({
    claim_id: z.string().min(1),
    verdict: z.enum(VERDICTS),
    issue_labels: z.array(z.enum(ISSUE_LABELS)),
    factual_core: z.string(),
    analysis: z.string().min(1),
    unresolved: z.array(z.string().min(1)),
    supporting_evidence_ids: z.array(z.string().min(1)),
    challenging_evidence_ids: z.array(z.string().min(1)),
    human_judgment_required: z.boolean(),
  })
  .strict();

export const InputSchema = z
  .object({
    type: z.enum(["text", "url", "document"]),
    content: z.string().min(1).max(30_000),
    title: z.string().min(1).max(200).nullable(),
    source_url: HttpUrlSchema.nullable(),
    file_name: z.string().min(1).max(255).nullable(),
    mime_type: z.string().min(1).max(100).nullable(),
  })
  .strict()
  .superRefine((input, context) => {
    if (input.type === "url" && input.source_url === null) {
      context.addIssue({
        code: "custom",
        message: "URL input requires source_url.",
        path: ["source_url"],
      });
    }
    if (input.type === "document" && input.file_name === null) {
      context.addIssue({
        code: "custom",
        message: "Document input requires file_name.",
        path: ["file_name"],
      });
    }
  });

export const AnalysisResultSchema = z
  .object({
    id: z.string().min(1),
    generated_at: z.iso.datetime(),
    input: InputSchema,
    claims: z.array(ClaimSchema).min(1),
    evidence: z.array(EvidenceSchema),
    findings: z.array(FindingSchema),
    limitations: z.array(z.string().min(1)),
    model: z.string().min(1),
    mode: z.enum(["live", "sample"]),
  })
  .strict();

export const ChallengeResultSchema = z
  .object({
    claim_id: z.string().min(1),
    challenged_at: z.iso.datetime(),
    outcome: z.enum(["holds", "qualified", "changed", "unresolved"]),
    original_finding: FindingSchema,
    revised_finding: FindingSchema,
    new_evidence: z.array(EvidenceSchema),
    explanation: z.string().min(1),
  })
  .strict();

export const AuditObservationSchema = z
  .object({
    claim_id: z.string().min(1),
    issue_labels: z.array(z.enum(ISSUE_LABELS)),
    checks: z.array(
      z
        .object({
          type: z.enum([
            "number",
            "date",
            "metadata",
            "inference",
            "attribution",
            "analogy",
            "context",
          ]),
          status: z.enum(["pass", "flag", "not_applicable"]),
          explanation: z.string().min(1),
          observed: z.string().nullable(),
          expected: z.string().nullable(),
        })
        .strict(),
    ),
  })
  .strict();

export type Claim = z.infer<typeof ClaimSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type Finding = z.infer<typeof FindingSchema>;
export type FalsifyInput = z.infer<typeof InputSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type ChallengeResult = z.infer<typeof ChallengeResultSchema>;
export type SourceProvenance = z.infer<typeof SourceProvenanceSchema>;
export type AuditObservation = z.infer<typeof AuditObservationSchema>;
