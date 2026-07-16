import type { Claim, Evidence, Finding, FalsifyInput } from "./schemas";

export const validInputFixture: FalsifyInput = {
  type: "text",
  content:
    "A source confirms spending increased, which alone proves a historical analogy.",
  title: null,
  source_url: null,
  file_name: null,
  mime_type: null,
};

export const validClaimFixture: Claim = {
  id: "claim-1",
  original_text: "A source confirms spending increased.",
  normalized_claim: "Spending increased.",
  claim_type: "factual",
  testability: "empirically_testable",
  evidence_requirements: ["Comparable official spending data"],
  falsification_questions: ["Do comparable official figures show no increase?"],
  time_sensitive: true,
  entities: ["spending"],
  source_span: { start: 0, end: 38 },
};

export const validEvidenceFixture: Evidence = {
  id: "evidence-1",
  claim_id: "claim-1",
  stance: "supporting",
  title: "Official spending table",
  url: "https://example.gov/spending",
  publisher: "Example Ministry",
  published_at: "2026-01-01",
  source_type: "primary_data",
  excerpt: "The comparable series increased from 10 to 12.",
  relevance: "direct",
  directness: "directly_supports",
  notes: null,
};

export const validFindingFixture: Finding = {
  claim_id: "claim-1",
  verdict: "PARTIALLY_SUPPORTED",
  issue_labels: ["INFERENCE_EXCEEDS_EVIDENCE"],
  factual_core: "The reported spending increase is supported.",
  analysis: "The source supports an increase but not the separate analogy.",
  unresolved: ["The analogy requires independently defined criteria."],
  supporting_evidence_ids: ["evidence-1"],
  challenging_evidence_ids: [],
  human_judgment_required: true,
};
