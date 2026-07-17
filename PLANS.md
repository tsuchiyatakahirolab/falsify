# PLANS.md — Falsify Build Week ExecPlan

This file is the execution source of truth. Update status in place. Do not expand scope without recording the tradeoff.

## Done condition

A submission-ready Falsify MVP exists when a judge can open a public URL, submit a supported input, receive an inspectable claim-level evidence audit, challenge at least one finding, and understand within three minutes why the product is different from a generic fact checker or AI reviewer.

## Milestone 0 — Repository and baseline

Status: COMPLETE (2026-07-17)

- Initialize application.
- Select final minimal stack.
- Add lint, typecheck, test, and formatting commands.
- Confirm environment-variable handling.
- Create a minimal landing page.
- Record exact setup commands in README and `DOCUMENTATION.md`.

Exit test:
- fresh install works;
- local app starts;
- checks pass.

## Milestone 1 — Typed domain model

Status: COMPLETE (2026-07-17)

Implement typed schemas for:
- document/input;
- atomic claim;
- falsification question;
- evidence item;
- finding/verdict;
- issue type;
- source provenance.

Use JSON Schema / TypeScript validation consistent with `schemas/`.

Exit test:
- schema fixtures validate;
- invalid enum/data cases fail.

## Milestone 2 — Claim decomposition

Status: COMPLETE (2026-07-17)

Build GPT-5.6 workflow to:
- extract atomic testable claims;
- distinguish empirical, quantitative, temporal, causal, attribution, comparison, historical analogy, interpretation, normative claim;
- mark non-empirically falsifiable content;
- generate explicit falsification questions and evidence requirements.

Exit test:
- golden cases produce structurally valid claims;
- normative statements are not falsely presented as empirical facts.

## Milestone 3 — Evidence retrieval and adversarial search

Status: COMPLETE (2026-07-17)

Build two deliberately separate evidence paths:
- support search;
- contradiction/challenge search.

Requirements:
- prefer primary/authoritative sources when possible;
- preserve URLs/titles/dates;
- avoid treating search snippets as final evidence when a source can be inspected;
- identify insufficient evidence explicitly.

Exit test:
- at least one sample yields distinct support and contradiction sets;
- missing evidence does not become invented evidence.

## Milestone 4 — Audit engine

Status: COMPLETE (2026-07-17)

Implement MVP audits:
- citation/source-fit where input supplies citations or linked sources;
- temporal fit;
- basic numeric consistency where extractable;
- inference overreach;
- selective-context indicator where evidence supports it.

Exit test:
- golden eval cases cover at least five issue classes.

## Milestone 5 — Evidence Map UI

Status: COMPLETE (2026-07-17)

Build:
- input screen;
- analysis progress;
- claim map;
- claim card;
- supporting and contradictory evidence panels;
- "what would make this wrong?" panel;
- limitations and unresolved evidence;
- source links.

Do not add a global credibility score.

Exit test:
- end-to-end local flow is understandable without developer explanation.

## Milestone 6 — Challenge this finding

Status: COMPLETE (2026-07-17)

Add adversarial re-check:
- user can challenge a finding;
- system re-evaluates using counter-evidence and records whether verdict changes, holds, or remains unresolved;
- original and revised finding remain inspectable.

Exit test:
- at least one golden/demo case changes or qualifies after re-check.

## Milestone 7 — Flagship narrative demo

Status: COMPLETE (2026-07-17)

Create one public-source demonstration involving a China-to-Japan strategic narrative.

Requirements:
- decompose factual core from framing, historical analogy, attribution, causal leap, and normative conclusion;
- acknowledge supported facts;
- surface legitimate criticism when warranted;
- test rebuttal symmetrically;
- do not infer deceptive intent without evidence.

Exit test:
- demo makes Falsify's differentiation obvious within 60 seconds.

## Milestone 8 — Privacy, security, public hardening

Status: COMPLETE (2026-07-17)

- prompt-injection boundaries;
- server-side API key only;
- no default permanent document retention;
- input limits;
- rate limits / abuse controls;
- error handling and timeouts;
- disclosure of external API processing;
- dependency review.

Exit test:
- public deployment does not expose secrets;
- malformed/untrusted input fails safely.

## Milestone 9 — Evals and polish

Status: IN PROGRESS

- run golden eval set;
- add regression tests;
- check mobile/desktop;
- improve latency messaging;
- add sample mode;
- finalize visual hierarchy.

Exit test:
- core flow passes smoke tests repeatedly.

## Milestone 10 — Deployment and submission package

Status: NOT STARTED

- deploy public demo;
- verify public repo and license;
- finalize README;
- document Codex use and GPT-5.6 use;
- capture primary `/feedback` Session ID;
- prepare <3 minute demo script and public YouTube video;
- add screenshots;
- confirm Work & Productivity category unless product scope materially changes;
- complete Devpost fields.

Exit test:
- independent judge can test immediately.
