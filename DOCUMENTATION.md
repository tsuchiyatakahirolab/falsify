# DOCUMENTATION.md — Build Status and Decision Log

Keep this file current throughout the build.

## Current status

- Project: Falsify
- Phase: Implementation
- Current milestone: Milestone 8
- Public demo: Not deployed
- Repository: Milestone 0 application baseline complete
- Primary Codex `/feedback` Session ID: Not captured
- Submission status: Devpost draft
- Git baseline: `main` at `2ae8b55f9298dddb60941a0d57d7b77cd16779d8`

## Current product decision

Falsify is an open-source adversarial evidence verification engine. It is not a generic peer reviewer, generic fact checker, or political rebuttal bot.

## Decision log

### D-001 — Open-source public layer
Decision: Falsify Core will be public and open source.
Reason: The verification method should be inspectable and reusable; public trust is part of the product value.

### D-002 — Independent from proprietary products
Decision: Public Falsify must not require XINAPI, NARRAPI, QUNAPI, or proprietary databases.
Reason: Preserve product boundaries, IP, reproducibility, and public accessibility.

### D-003 — China-to-Japan as flagship use case, not hard-coded ideology
Decision: Use a China-to-Japan strategic narrative as the first deep demo while applying symmetric evidentiary standards.
Reason: This is a real, domain-expert use case and demonstrates narrative decomposition better than a generic toy example.

### D-004 — No overall truth/credibility score
Decision: Use claim-level verdicts and issue labels.
Reason: A single score creates false precision and encourages misuse.

### D-005 — Falsify itself is falsifiable
Decision: Provide an adversarial re-check / challenge function.
Reason: The tool's own judgments must remain inspectable and revisable.

### D-006 — Single Next.js application baseline
Decision: Use a Next.js App Router application with TypeScript, React, ESLint, Prettier, and Vitest. Keep model orchestration server-side and add no database, authentication layer, or UI framework for the MVP baseline.
Reason: One typed application can deliver the public UI and server-only analysis path with the fewest deployment and integration seams.

### D-007 — Compatible toolchain pins
Decision: Pin Next.js 16.2.10, React 19.2.7, TypeScript 6.0.3, and ESLint 9.39.5; override PostCSS to patched version 8.5.10.
Reason: TypeScript 7 and ESLint 10 are newer than the current Next.js lint stack supports. The compatible pins pass all checks, and the PostCSS override removes the reported production vulnerability.

### D-008 — Zod runtime model with JSON Schema parity
Decision: Use strict Zod schemas as the application runtime boundary while retaining and testing the public JSON Schemas. Model-produced nullable metadata fields are required so Structured Outputs cannot silently omit them.
Reason: The UI and engine need inferred TypeScript types, runtime rejection, and an open format that non-TypeScript consumers can inspect.

### D-009 — GPT-5.6 Structured Outputs with a bounded fallback
Decision: Use `gpt-5.6` through `responses.parse` and `zodTextFormat` for live decomposition. When no server API key exists, use an explicitly labeled deterministic fallback that does not claim to have searched for evidence.
Reason: GPT-5.6 remains substantial in the deployed live path, while local setup and judge fallback remain safe and inspectable instead of fabricating model or search output.

### D-010 — Citation-allowlisted dual evidence paths
Decision: Run support and challenge as separate GPT-5.6 web-search requests. Accept a model-proposed evidence URL only when the same response contains an official `url_citation` annotation for its normalized URL, and replace the proposed title with the cited title.
Reason: Separate tasks reduce confirmation bias; citation allowlisting prevents a structurally valid model response from introducing a source the hosted search did not actually return.

### D-011 — Deterministic checks are binding inputs to synthesis
Decision: Run date, number, causal, attribution, historical-analogy, selective-context, and source-fit rules before synthesis, then merge their issue labels into any GPT-5.6 finding.
Reason: Deterministic observations should remain visible even if model wording varies, while GPT-5.6 handles contextual synthesis and qualified explanation.

### D-012 — Stateless typed analysis and challenge APIs
Decision: Keep analysis state in the browser and send the validated analysis bundle back only when challenging a finding. Process text documents client-side and retain no server-side session or manuscript store.
Reason: This delivers the complete interaction without a database, preserves inspectability, and honors the MVP's no-default-retention policy.

### D-013 — Curated flagship fixture with symmetric intent standards
Decision: Ship the flagship China-to-Japan narrative as a versioned, public-source sample fixture while keeping live analysis generic. Apply the same evidence threshold to both the original PRC attribution of Japanese intent and Japan's reciprocal attribution of Chinese intent.
Reason: A stable judge path must remain demonstrable without an API key, but political conclusions must not be hard-coded into the analysis engine. The fixture exposes its curation date, sources, translations, and limitations.

## Build log

Add dated entries below.

### 2026-07-17 — Milestone 0
- Work completed: Verified the 27-file starter manifest; confirmed there was no application code or Git repository; created a Next.js/TypeScript application baseline; added an evidence-first responsive landing page, metadata, a landing-page regression test, lint/typecheck/test/format/build commands, and reproducible setup instructions.
- Decisions: Adopted the single-application stack in D-006 and compatible dependency pins in D-007. Kept the page explicitly claim-level and non-scoring. Deferred all live analysis behavior to later milestones.
- Commands/tests:
  - `npm ci` — PASS; 385 packages installed from lockfile, 0 vulnerabilities.
  - `npm run lint` — PASS.
  - `npm run typecheck` — PASS.
  - `npm test` — PASS; 1 test file and 1 test passed.
  - `npm run format` — PASS.
  - `npm run build` — PASS; `/` and `/_not-found` prerendered successfully.
  - Local HTTP smoke at `http://127.0.0.1:3000` — PASS; HTTP 200 and expected title.
  - In-app browser smoke — PASS; semantic content rendered, the primary evidence-map link worked, the target was visible, and no console errors were reported.
- Result: Milestone 0 exit test passed. Fresh install works, the local app starts, and all baseline checks pass.
- Next: Begin Milestone 1 by reconciling the repository JSON Schemas into a runtime-validated TypeScript domain model with valid and invalid fixtures.

### 2026-07-17 — Milestone 1
- Work completed: Initialized Git on `main` and created the audited Milestone 0 baseline commit `2ae8b55f9298dddb60941a0d57d7b77cd16779d8`. Added strict runtime schemas and types for inputs, claims, falsification questions, evidence, provenance, findings, analysis results, and challenge results. Reconciled nullable required fields in the public JSON Schemas and added shared fixtures plus dual Zod/Ajv validation.
- Decisions: Adopted D-008. Added OpenAI and Zod as direct dependencies, and Ajv/ajv-formats for public schema parity tests. Recorded the independent validation matrix in `docs/research/runtime-validation-test-matrix.md`.
- Commands/tests:
  - `npm run typecheck` — PASS.
  - `npm test` — PASS; 2 files and 5 tests passed.
  - `npm run lint` — PASS.
- Result: Milestone 1 exit test passed; valid fixtures validate through both runtime and public schemas, and invalid enum/data cases fail.
- Next: Implement GPT-5.6 claim decomposition with Structured Outputs, prompt-injection boundaries, sample fallback, and golden decomposition tests.

### 2026-07-17 — Milestone 2
- Work completed: Added the server-only OpenAI client, pinned the default live model to `gpt-5.6`, implemented Responses API Structured Outputs claim decomposition, normalized/validated every model claim, added an explicit untrusted-content boundary, and provided a deterministic no-key fallback. Added golden-case, normative, and premise/inference decomposition tests.
- Decisions: Adopted D-009. Verified the current OpenAI contract against official model, Structured Outputs, and web-search documentation. Installed the official OpenAI developer-docs MCP for future Codex sessions.
- Commands/tests:
  - `npm run typecheck` — PASS.
  - `npm test` — PASS; 3 files and 8 tests passed, including all eight golden inputs.
  - `npm run lint` — PASS.
- Result: Milestone 2 exit test passed. Golden inputs produce valid atomic claims with falsification questions, and normative statements are not labeled empirically testable. The external live call is not executable locally until an owner supplies `OPENAI_API_KEY`; the integration is compiled and runtime validated.
- Next: Build separate support and contradiction web-search paths, enforce citation-provenance allowlisting, and add safe insufficient-evidence behavior.

### 2026-07-17 — Milestone 3
- Work completed: Implemented independent support and adversarial evidence prompts/calls with GPT-5.6 hosted web search. Added recursive extraction of official URL citation annotations, HTTP(S) normalization, claim/stance validation, path separation, deduplication, and strict rejection of uncited model-proposed URLs. Added explicit unresolved and no-key states.
- Decisions: Adopted D-010. Source titles are taken from citation annotations rather than trusted from model JSON.
- Commands/tests:
  - `npm run typecheck` — PASS.
  - `npm test` — PASS; 4 files and 12 tests passed.
  - `npm run lint` — PASS.
- Result: Milestone 3 exit test passed. Fixtures produce distinct support and challenge sets, and missing or unallowlisted evidence remains empty instead of becoming invented evidence.
- Next: Implement deterministic number/date audits, inference/attribution/analogy checks, model synthesis, and golden issue evaluation.

### 2026-07-17 — Milestone 4
- Work completed: Added typed audit observations and deterministic rules for dates, tenfold/ratio mismatches, causal overreach, unsupported source fit, attribution of intent, historical analogy, selective context, and inference strength. Added GPT-5.6 structured finding synthesis with binding deterministic-label merging and a safe local synthesizer. Corrected G007 so `LEGITIMATE_CRITICISM` is evaluated as a verdict rather than an issue label.
- Decisions: Adopted D-011. Model evidence IDs are allowlisted against the actual evidence bundle during synthesis.
- Commands/tests:
  - `npm run typecheck` — PASS.
  - `npm test` — PASS; 5 files and 14 tests passed.
  - `npm run lint` — PASS.
- Result: Milestone 4 exit test passed. All eight golden cases match their intended issue/verdict mechanics across seven issue classes, with an explicit negative control against calling a supported association false.
- Next: Assemble the analysis orchestrator and API, then replace the static shell with the interactive Evidence Map and Claim Card interface.

### 2026-07-17 — Milestone 5
- Work completed: Added input normalization for pasted text, public text/HTML URLs, and client-read text documents. Added the typed analysis orchestrator and /api/analyze. Rebuilt the landing page as an interactive workbench with progress/error states, claim map, detailed Claim Cards, falsification questions, support/challenge columns, clickable provenance, audit labels, limitations, and unresolved evidence. Added responsive layouts and explicit limited-mode labeling.
- Decisions: Adopted D-012. No analysis state or uploaded document is persisted by the server.
- Commands/tests:
  - npm run typecheck — PASS.
  - npm test — PASS; 6 files and 15 tests passed after updating the pre-result landing regression.
  - npm run lint — PASS.
  - npm run build — PASS after replacing Zod's bundled datetime helper with an equivalent explicit UTC timestamp regex to avoid a Next.js 16 Turbopack initialization defect.
  - In-app browser E2E — PASS; submitted a two-claim passage, rendered two Claim Cards, displayed both evidence paths, falsification questions, historical-analogy audit, and honest no-key limitations.
- Result: Milestone 5 exit test passed. The complete local input-to-Evidence-Map path is understandable without developer explanation and contains no global credibility score.
- Next: Complete and validate the adversarial re-check, including a flagship sample whose finding visibly qualifies or changes.

### 2026-07-17 — Milestones 6 and 7
- Work completed: Added a typed `/api/challenge` flow that preserves the original finding, runs an independent adversarial re-check in live mode, and reports whether the finding changes, qualifies, holds, or remains unresolved. Added a public-source flagship fixture that separates the Japanese budget/capability premise from historical analogy and reciprocal intent attributions. Added a one-click demo route and UI entry point. The sample challenge introduces a National Diet research report and qualifies the finding by acknowledging legitimate domestic concern without treating the strongest historical analogy as established.
- Decisions: Adopted D-013. The fixture is isolated from generic analysis logic, explicitly labeled as curated, and based only on public PRC MFA, Japan MOD/Cabinet Secretariat/National Diet, and SIPRI sources recorded in `docs/research/flagship-china-japan-narrative-source-set.md`.
- Commands/tests:
  - `npm run typecheck` — PASS.
  - `npm test` — PASS; 8 files and 18 tests passed, including schema validity, source provenance, symmetric intent flags, and the qualifying re-check.
  - `npm run lint` — PASS.
  - `npm run build` — PASS; `/`, `/api/analyze`, `/api/challenge`, and `/api/demo` built successfully.
  - Production-server HTTP smoke — PASS; `/` and `/api/demo` returned HTTP 200.
  - In-app browser flagship E2E — PASS; rendered four atomic claims, six allowlisted sources, reciprocal `ATTRIBUTION_NOT_ESTABLISHED` findings, and no console errors.
  - In-app browser adversarial re-check — PASS; Claim 2 changed to `QUALIFIED`, preserved the original and revised verdicts, and exposed the new National Diet counter-evidence.
- Result: Milestones 6 and 7 exit tests passed. Falsify's own finding is challengeable, and the flagship demo communicates the product's non-scoring, symmetric evidence method in under 60 seconds.
- Next: Harden public URL ingestion, quotas, API errors, response headers, and dependency posture before release evals.
