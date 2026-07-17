# Golden Evaluation Results

Run date: 2026-07-17

Command: `npm run eval:golden`

Result: **PASS — 8/8 golden cases matched their intended primary issue or verdict mechanics.**

| Case | Expected behavior | Result |
| --- | --- | --- |
| G001 | Separate association from causation | PASS — `CAUSAL_OVERREACH` |
| G002 | Require current evidence for a current ranking | PASS — `OUTDATED` |
| G003 | Detect that 10 to 32 is not tenfold | PASS — `NUMERICAL_MISMATCH` |
| G004 | Preserve the spending fact while testing the analogy | PASS — `HISTORICAL_ANALOGY_NOT_ESTABLISHED` |
| G005 | Do not infer secret intent from outcome | PASS — `ATTRIBUTION_NOT_ESTABLISHED` |
| G006 | Distinguish topical relevance from direct support | PASS — `UNSUPPORTED` |
| G007 | Preserve supported criticism despite loaded framing | PASS — `LEGITIMATE_CRITICISM` |
| G008 | Flag an unevidenced asymmetric comparison carefully | PASS — `SELECTIVE_CONTEXT` |

Two regression controls also passed:

- G001 does not relabel the supported observational association as a false factual claim merely because the causal conclusion overreaches.
- An adjacent historical-analogy claim does not leak its issue label into a separate draft-budget factual claim.

## Interpretation boundary

This suite validates deterministic audit mechanics and verdict/issue ontology. It does not substitute for a live end-to-end GPT-5.6 quality evaluation. The local environment did not contain `OPENAI_API_KEY`, so live model/web-search calls remain an owner-run deployment smoke test. The public curated flagship demo is separately schema-, provenance-, symmetry-, and browser-tested.
