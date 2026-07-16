# Runtime Validation and Deterministic Audit Test Matrix

Scope: independent test-design review for Milestones 1–4. This note does not
change the implementation plan or milestone status.

## Highest-priority schema incompatibilities

1. **Golden-case ontology mismatch.** `G007.expected_primary_issue` is
   `LEGITIMATE_CRITICISM`, but that value is a finding `verdict`, not an
   `issue_label`. The eval representation should carry separate
   `expected_verdict` and `expected_issue_labels` fields. Avoid adding a duplicate
   issue label merely to make the fixture pass.
2. **Structured Outputs strictness.** The existing schemas have optional object
   properties (`entities`, `source_span`, evidence metadata fields, and
   `human_judgment_required`). OpenAI strict Structured Outputs expects object
   schemas with `additionalProperties: false` and, in practice, every declared
   property listed in `required`; optional values should be required nullable
   fields or omitted from the model-facing schema and defaulted after validation.
   Do not rely on the JSON Schema `default` for `human_judgment_required` to be
   applied by either the model or a validator.
3. **Missing Milestone 1 domain objects.** There is no schema for input/document,
   a structured falsification question, source provenance independent of an
   evidence assessment, or a typed audit issue. Claim questions are strings and
   provenance is conflated with `FalsifyEvidence`.
4. **Evidence relationship ambiguity.** `stance` can be `contradicting`, while
   `directness` only has support-oriented values such as `directly_supports`.
   This permits contradictory evidence marked `directly_supports` with no stated
   target. Either rename the field to a neutral relation strength (for example,
   `directly_addresses`) or add a validated compatibility rule.
5. **Cross-object integrity is not represented by JSON Schema.** Validators must
   separately enforce unique IDs, evidence `claim_id` references, finding evidence
   references, stance/list compatibility, and no evidence item appearing in both
   supporting and challenging lists.
6. **Source spans are only shape-validated.** The claim schema allows `end < start`
   and offsets beyond the submitted text. Runtime domain validation must enforce
   `0 <= start < end <= input.length` and confirm the extracted substring is the
   intended `original_text` under the chosen offset convention.
7. **Weak scalar constraints.** Claim/evidence IDs and evidence titles may be empty;
   question/evidence-requirement strings may be empty; `published_at` accepts any
   string; arrays allow duplicates. Add non-empty/unique constraints and parse
   dates deterministically. A JSON Schema `format: uri` check may also require an
   explicit validator format plugin; verify it is actually active.
8. **Finding combinations are unconstrained.** Examples currently accepted include
   `SUPPORTED` plus `FALSE_FACTUAL_CLAIM`, `NOT_VERIFIABLE` with no unresolved
   explanation, or evidence IDs in the wrong stance list. Treat these as domain
   invariants even if the transport schema accepts them.
9. **No representation for audit observations.** A bare issue label cannot expose
   the operands behind a numeric/date/citation check. An inspectable audit issue
   should retain rule ID, claim/source values, explanation, evidence IDs, and
   uncertainty or applicability.
10. **Schema duplication drift risk.** If TypeScript/Zod and the checked-in JSON
    Schemas are maintained separately, enum and required-field drift is likely.
    Pick one canonical definition and add parity/snapshot tests for the generated
    or imported counterpart.

## Milestone 1 — runtime validation matrix

| ID | Fixture or mutation | Expected result |
| --- | --- | --- |
| M1-01 | Minimal complete valid claim for each `claim_type` and `testability` value | Accept; round-trip without field loss |
| M1-02 | Unknown `claim_type: "opinion"` | Reject with path `claim_type` |
| M1-03 | Empty `original_text`, `normalized_claim`, question, or evidence requirement | Reject the relevant path |
| M1-04 | `source_span: {start: 8, end: 3}` or end beyond input length | Reject in domain validation |
| M1-05 | Normative claim marked `empirically_testable` | Reject or return a named semantic-validation issue |
| M1-06 | Valid supporting and contradicting evidence with full nullable metadata | Accept both without support-oriented field ambiguity |
| M1-07 | Empty/malformed/relative URL, non-HTTP URL if only public web sources are supported | Reject URL with a stable error code |
| M1-08 | Invalid calendar date (`2026-02-30`), locale date (`07/08/26`), and valid ISO date | Reject first two; accept documented ISO representation |
| M1-09 | Duplicate claim/evidence IDs and dangling `claim_id` | Reject analysis bundle |
| M1-10 | Finding references a missing evidence ID, duplicates an ID, or puts a contradicting item in `supporting_evidence_ids` | Reject analysis bundle |
| M1-11 | Extra model field at each object depth | Reject because all structured objects are closed |
| M1-12 | Missing nullable field in the strict model-facing schema | Reject model output; nullable value should accept explicit `null` |
| M1-13 | `human_judgment_required` absent | Verify intentional behavior: reject at transport boundary or default in an explicit normalization step, never implicitly |
| M1-14 | TypeScript/validator/JSON-Schema enum parity snapshot | Exact set equality |
| M1-15 | Valid and invalid input variants: text, URL, document metadata | Accept exactly one input mode; reject zero or multiple payloads and oversized values |

Property/fuzz cases worth adding early: every enum rejects an arbitrary adjacent
value; every required field fails when deleted; every object fails with an added
key; ID/reference arrays remain unique; span boundaries are generated around 0 and
the input length.

## Milestone 2 — decomposition contract matrix

| ID | Input | Expected structural/semantic behavior |
| --- | --- | --- |
| M2-01 | `The policy began in 2024 and reduced unemployment by 20%.` | At least two atomic claims (temporal and quantitative/causal); source spans valid |
| M2-02 | `The policy is unjust.` | `normative` and `not_empirically_falsifiable`; no fabricated empirical verdict |
| M2-03 | `Spending rose, proving the country revived a pre-war ideology.` | Separate spending fact from historical-analogy/inference proposition |
| M2-04 | `Officials secretly intended to provoke conflict.` | Attribution/intent claim; question asks for direct or circumstantial intent evidence |
| M2-05 | `Country A is now the largest producer.` | Temporal/comparative dimensions preserved; `time_sensitive: true` |
| M2-06 | Prompt-injection text asking the analyst to skip validation | Treated as quoted input; output remains schema-valid and follows system workflow |
| M2-07 | Repeated sentence and overlapping clauses | Stable deduplication; no duplicate normalized claim IDs |
| M2-08 | Empty/whitespace and over-limit input | Deterministic safe error, no model call |

For all M2 cases, assert more than parse success: every empirically testable claim
has a non-empty falsification question that describes evidence capable of weakening
the claim, rather than simply negating or restating it.

## Milestone 3 — evidence retrieval contract matrix

| ID | Setup | Expected result |
| --- | --- | --- |
| M3-01 | Synthetic provider returns one support and one challenge source | Distinct path/run identity and distinct validated sets |
| M3-02 | Support provider returns a challenge result (or reverse) | Preserve observed stance but record retrieval path; do not silently relabel provenance |
| M3-03 | Search returns snippet only and source inspection fails | Mark unavailable/insufficient; do not elevate snippet into inspected evidence |
| M3-04 | Provider returns title/URL but no publication date | Accept explicit `null`; temporal audit becomes unresolved, not current |
| M3-05 | Provider returns malformed URL or invented reference without retrievable provenance | Reject/quarantine item; finding cannot cite it |
| M3-06 | Same canonical URL appears in both paths | Deduplicate presentation while preserving both retrieval-path records; do not claim independent corroboration |
| M3-07 | Source page contains prompt injection | Page text remains evidence data; orchestration instructions are unchanged |
| M3-08 | One path times out while the other succeeds | Return typed partial result with the failed path identified; no confident synthesis from absence |
| M3-09 | No evidence found | Empty evidence sets plus `INSUFFICIENT_EVIDENCE`/unresolved explanation; never generated citations |
| M3-10 | Primary and secondary sources conflict | Preserve both provenance records and uncertainty; no authority-only automatic verdict |

Use fake retrieval adapters for these contract tests. Live-web evals should be a
separate, non-blocking suite because current web state is nondeterministic.

## Milestone 4 — deterministic audit cases

These cases provide at least eight issue classes while keeping the expected
operands inspectable.

| ID / golden | Claim and evidence operands | Expected issue / verdict behavior |
| --- | --- | --- |
| A-01 / G001 | Claim says `caused`; cited source explicitly says observational association | `CAUSAL_OVERREACH`; preserve association as factual core |
| A-02 / G002 | Claim says `currently` in 2026; only ranking is dated 2019 | `OUTDATED`; do not infer that the ranking changed, require current evidence |
| A-03 / G003 | Claim says tenfold; comparable values are 10 and 32 | `NUMERICAL_MISMATCH`; record expected 100 vs observed 32 (3.2x) |
| A-04 / G004 | Spending increase is supported; no evidence connects it to revival of pre-war ideology | `HISTORICAL_ANALOGY_NOT_ESTABLISHED`; likely `PARTIALLY_SUPPORTED` for compound source material after decomposition |
| A-05 / G005 | Policy outcome is documented; intent evidence absent | `ATTRIBUTION_NOT_ESTABLISHED`; absence is not proof of contrary intent |
| A-06 / G006 | Real same-topic paper lacks the claimed number | `UNSUPPORTED` plus finding verdict `SOURCE_MISMATCH`; source existence is not source fit |
| A-07 / G007 | Documented policy change plus loaded framing | Verdict `LEGITIMATE_CRITICISM`; no issue label required solely due to tone |
| A-08 / G008 | One country selected, evidenced peers omitted under the same stated criterion | `SELECTIVE_CONTEXT`; only emit when peer comparison operands are available |
| A-09 | Source says 12%, claim says 0.12% | `NUMERICAL_MISMATCH`; normalize percent units before comparison |
| A-10 | Source says 100 to 120, claim says `rose by 120%` | `NUMERICAL_MISMATCH`; distinguish endpoint from percent change (20%) |
| A-11 | Source is dated after a claim framed as knowledge available at an earlier cutoff | Temporal mismatch/out-of-window observation; do not treat later evidence as contemporaneous proof |
| A-12 | Evidence supports membership in category X; conclusion switches to morally/politically loaded category Y | `CATEGORY_SHIFT` or `INFERENCE_EXCEEDS_EVIDENCE`, with both categories retained in explanation |

### Negative controls

- Current claim plus current authoritative evidence must not emit `OUTDATED`.
- A randomized experiment that directly estimates the stated causal effect must not
  emit `CAUSAL_OVERREACH` merely because the claim uses causal language.
- A claim of roughly threefold growth for 10 to 32 must not emit
  `NUMERICAL_MISMATCH` when the tolerance and rounding policy accepts it.
- A documented quotation of stated intent must not emit
  `ATTRIBUTION_NOT_ESTABLISHED`; it may still require an authenticity/context check.
- Multiple relevant comparison cases presented with an explicit selection rationale
  must not emit `SELECTIVE_CONTEXT` solely because the set is incomplete.

## Suggested executable fixture shape

Golden rows should become typed JSON objects rather than prose-only expectations:

```json
{
  "id": "G003",
  "input": "The text says spending rose tenfold, while the supplied source shows an increase from 10 to 32 in comparable units.",
  "expected": {
    "issue_labels": ["NUMERICAL_MISMATCH"],
    "allowed_verdicts": ["CONTRADICTED", "PARTIALLY_SUPPORTED", "SOURCE_MISMATCH"],
    "must_preserve_factual_core": true,
    "must_not_assert": ["The source is fabricated"]
  },
  "audit_fixture": {
    "claimed_start": 10,
    "claimed_end": 100,
    "observed_start": 10,
    "observed_end": 32,
    "unit": "comparable_units"
  }
}
```

Keep two layers of tests:

1. **Deterministic unit/contract tests** assert exact schema errors, reference
   integrity, date/number computations, and issue applicability.
2. **Model golden evals** assert allowed semantic outcomes and prohibited behavior.
   They should not require exact wording or a single verdict where multiple
   qualified outcomes are defensible.

## Minimum gate recommendation

- Milestone 1: all valid fixtures accepted; every invalid mutation rejected; JSON
  Schema/runtime/type enum parity passes.
- Milestone 2: 100% structurally valid output; normative control passes; all source
  spans and falsification questions pass semantic checks.
- Milestone 3: no invented source in deterministic or reviewed live cases; partial
  failures remain explicit; support/challenge path identity is retained.
- Milestone 4: exact deterministic pass for at least five issue classes plus their
  negative controls; golden model eval meets the documented 80% semantic threshold.
