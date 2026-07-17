# DOCUMENTATION.md — Build Status and Decision Log

Keep this file current throughout the build.

## Current status

- Project: Falsify
- Phase: Release candidate
- Current milestone: Milestone 10
- Public demo: <https://falsify-mu.vercel.app/> (curated demo deployed; Gemini Production integration configured; free Search-grounding quota confirmed as zero)
- Repository: <https://github.com/tsuchiyatakahirolab/falsify> (public, MIT)
- Public video: <https://youtu.be/hht1DsS66n0> (1:50, public, English narration and captions)
- Primary Codex `/feedback` Session ID: Captured privately for the Devpost submission form; intentionally omitted from the public repository
- Submission status: Public demo, repository, YouTube video, and `/feedback` Session ID complete; final link sweep and Devpost submission pending
- Git baseline: `main` (Gemini quota-boundary release; see repository history for exact HEAD)

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

### D-014 — Pinned public-network retrieval and best-effort demo quotas

Decision: Resolve and validate every public URL hop, reject any private/local/reserved address, pin the approved address into the outbound socket lookup, cap redirects/time/bytes, and accept only standard scheme ports. Bound API bodies and GPT output, return sanitized errors, send no-store/security headers, and apply per-instance quotas keyed only by Vercel's trusted client-IP header.
Reason: Public URL analysis otherwise creates an SSRF and resource-exhaustion surface. The in-memory limiter is intentionally a Build Week best-effort control; a multi-instance production service should add platform-level rate limiting or a shared store.

### D-015 — Transparent Gemini public provider

Decision: Preserve the complete GPT-5.6 Responses API implementation and add a transparent Gemini provider for public support and challenge searches after the Build Week promotional OpenAI credits were exhausted. Always display the actual runtime model and never describe Gemini output as GPT-5.6.
Reason: Provider substitution must not obscure provenance or weaken the existing curated fallback. A fresh-search path may run only when provider quota is actually available.

### D-016 — Two-call grounded-search mode for free-tier reliability

Decision: In Gemini mode, use deterministic claim decomposition and finding audits, and reserve Gemini for sequential support and challenge Google Search-grounded requests. Build evidence only from grounding support-to-source metadata, cap four sources per claim per path, render the Search Suggestions attribution returned by Google, and return explicit partial states on quota failure.
Reason: The free tier has project/model request limits. Two sequential calls preserve the separate adversarial paths while remaining materially more reliable than a six-call pipeline. Grounding metadata keeps URLs allowlisted without a second model-formatting request.

### D-017 — Zero-quota boundary is explicit

Decision: Use `gemini-3.1-flash-lite` as the compatible configured model for new projects, but do not claim that the current public project has free Search-grounding capacity. Keep the curated public-source fixture as the reliable zero-cost judge path, retain graceful no-invention fallback for fresh submissions, and do not enable billing without explicit owner approval.
Reason: Production verification showed that Gemini 2.5 Flash-Lite returns HTTP 404 as unavailable to new users, Gemini 3.1 Flash-Lite grounded requests return HTTP 429 `RESOURCE_EXHAUSTED`, and Gemini 3.1 Flash Live Preview also closes with a quota-exhausted error. The implementation cannot manufacture a free quota that Google has set to zero.

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

### 2026-07-17 — Milestone 8

- Work completed: Replaced direct URL fetches with public-network-only retrieval that rejects credentials, non-default ports, localhost/private/link-local/reserved/mapped addresses, validates every redirect, rejects mixed public/private DNS answers, and pins the approved address into the HTTP(S) socket lookup. Added a ten-second total deadline, one-megabyte streamed response cap, identity encoding, redirect-body discard, 64 KiB analysis and 512 KiB challenge request caps, bounded GPT output, safe error codes, no-store API responses, security headers, and best-effort per-instance quotas. Added canonical-fixture integrity validation before the curated challenge shortcut.
- Independent review: A bounded read-only security review identified SSRF, response/body exhaustion, raw error, quota/header, and demo-integrity risks. Its follow-up reviewed the new implementation and prompted expanded IPv4-mapped IPv6 detection, total rather than inactivity-only timeouts, trusted-proxy tightening, bucket growth bounds, redirect-body discard, and scheme-specific ports. All were integrated by the primary thread.
- Commands/tests:
  - `npm run typecheck` — PASS.
  - `npm test` — PASS; 12 files and 54 tests passed, including private/mapped/numeric-address rejection, mixed DNS rejection, body limits, quota/reset/bucket bounds, SSRF API response, safe demo mutation rejection, and exact canonical challenge acceptance.
  - `npm run lint` — PASS.
  - `npm run build` — PASS.
  - `npm audit` and `npm audit --omit=dev` — PASS; 0 vulnerabilities.
  - Production HTTP hardening smoke — PASS; CSP, HSTS, nosniff, frame denial, and no-store headers present; loopback analysis returned safe HTTP 422 `PRIVATE_NETWORK_BLOCKED`.
  - In-app browser production smoke — PASS; CSP did not break the page, the curated badge rendered, four claims and two symmetric attribution flags appeared, and no console errors were reported.
- Result: Milestone 8 exit test passed. Malformed and untrusted input fails safely, server keys remain private, and public deployment has bounded request/retrieval/cost surfaces appropriate to the MVP.
- Residual limitation: The in-memory quota is per application instance. Public deployment should pair it with Vercel Firewall/rate limiting or a shared limiter before sustained high traffic.
- Next: Run the clean-install golden eval and regression suite, validate responsive layouts, improve release polish, and repeat the full core flow.

### 2026-07-17 — Milestone 9

- Work completed: Added a dedicated `npm run eval:golden` command and durable results record at `evals/RESULTS.md`. Re-ran the entire repository from `npm ci`, confirmed the curated demo badge and hierarchy, and captured desktop and mobile Evidence Map screenshots under `docs/assets/`.
- Commands/tests:
  - `npm ci` — PASS; 393 packages installed and 0 vulnerabilities.
  - `npm ls --depth=0` — exit 0; npm labels five optional WASM runtime support packages as extraneous even after `npm prune`, with no audit or runtime failure.
  - `npm run eval:golden` — PASS; 8/8 golden cases matched their intended primary issue/verdict mechanics, plus the causal negative control.
  - `npm run format` — PASS.
  - `npm run typecheck` — PASS.
  - `npm test` — PASS; 12 files and 54 tests passed.
  - `npm run lint` — PASS.
  - `npm run build` — PASS.
  - In-app browser desktop audit at 1280 px — PASS; four Claim Cards, no horizontal overflow, and no console errors.
  - In-app browser mobile audit at 390 px — PASS; four Claim Cards, one-column evidence grid, visible challenge control, no horizontal overflow, and no console errors.
- Result: Milestone 9 exit test passed. The clean-install core flow is repeatable, responsive, and backed by an explicit golden evaluation record.
- Evaluation boundary: The environment has no `OPENAI_API_KEY`; live GPT-5.6/web-search quality remains an owner-run deployed smoke test and is not represented as locally passed.
- Next: Finalize the public README, judge/deployment guidance, Devpost copy, sub-three-minute demo script, release checklist, and final adversarial release decision.

### 2026-07-17 — Milestone 10 release-candidate validation

- Work completed: Rewrote the README around the judge path and differentiating method; prepared the deployment guide, judge guide, Devpost copy, 2:40 demo script, and release checklist; corrected the flagship sample to distinguish the official FY2026 draft budget proposal from final Diet enactment; changed contextual sources used to challenge an inference into the challenging evidence column; prevented deterministic issue labels from leaking across adjacent claims; and clarified that evidence excerpts are source summaries or paraphrases unless exact quoted text was inspected.
- Commands/tests:
  - `npm run format` — PASS.
  - `npm run typecheck` — PASS.
  - `npm test` — PASS; 12 files and 55 tests passed.
  - `npm run lint` — PASS.
  - `npm run eval:golden` — PASS; 8/8 cases plus the causal and cross-claim-label leakage controls passed.
  - `npm audit` and `npm audit --omit=dev` — PASS; 0 vulnerabilities.
  - `npm run build` — PASS; the page and all three API routes built successfully.
  - `git diff --check` — PASS; only expected Git line-ending notices were emitted.
  - In-app browser production smoke — PASS; loaded four curated claims and six allowlisted sources, challenged Claim 2, received `qualified`, preserved original/revised findings, and exposed the National Diet counter-evidence.
  - Desktop browser audit — PASS; four Claim Cards, no horizontal overflow, and no console warnings/errors.
  - 390 px browser audit — PASS after viewport reflow; one-column Claim Card content, four challenge controls, no horizontal overflow, and no console warnings/errors.
- Environment readiness: GitHub CLI and Vercel CLI are authenticated. No Git remote, public `falsify` repository, Vercel project, `.env.local`, or process-level `OPENAI_API_KEY` exists yet.
- Result: `PARTIAL_PASS_OWNER_ACTION_REQUIRED`. The repository is a locally validated release candidate. Milestone 10 remains in progress until the public repository, deployment, live GPT-5.6 smoke, video, `/feedback` Session ID, and final Devpost submission are complete.
- Validation note: Running `npm test` and `npm run eval:golden` concurrently on Windows caused one transient `EPERM` while both accessed the golden fixture. The required sequential release run passed; keep these checks sequential in the release procedure.
- Next: Confirm the intended public GitHub owner/repository and production OpenAI key, then create the remote, deploy, and run the signed-out live smoke.

### 2026-07-17 — Milestone 10 public deployment

- Work completed: Created the public GitHub repository `tsuchiyatakahirolab/falsify`, pushed `main`, verified the remote commit and MIT license, connected the repository to the Vercel project `tsuchiya-labs-projects/falsify`, and deployed the production alias <https://falsify-mu.vercel.app/>.
- Public deployment: Vercel deployment `dpl_95WcxRMbNRu1p7za93sBqu8zSA62` reached `READY`; the canonical alias and two Vercel-generated aliases resolve to the production build.
- Public smoke:
  - `/` — HTTP 200.
  - `/api/demo` — HTTP 200 with `Cache-Control: no-store, max-age=0`.
  - Security headers — PASS; CSP, HSTS, `nosniff`, and `X-Frame-Options: DENY` present.
  - Private URL submission — PASS; HTTP 422 `PRIVATE_NETWORK_BLOCKED`.
  - In-app browser — PASS; four Claim Cards, six source links, no horizontal overflow, and no console warnings/errors.
  - Claim 2 adversarial re-check — PASS; outcome `qualified`, original/revised findings preserved, and the National Diet counter-evidence displayed.
- Live-path boundary: Vercel currently has no environment variables for this project. A normal text submission returned `mode: sample`, `model: deterministic-fallback`, two claims, zero evidence items, and explicit limitations. This is the intended no-key behavior and is not counted as a live GPT-5.6/web-search pass.
- Result: Public repository and judge-testable curated deployment are complete. Milestone 10 remains `IN PROGRESS` until the production OpenAI key, live GPT-5.6 smoke, platform-level limits, public YouTube demo, `/feedback` Session ID, and Devpost submission are complete.
- Next: Add `OPENAI_API_KEY` to Vercel Production, redeploy, and run the live input from `docs/JUDGE_GUIDE.md`.

### 2026-07-17 — Milestone 10 Gemini release candidate

- Work completed: Added a server-only provider selector and the official `@google/genai` SDK; retained the optional GPT-5.6 Responses API path; implemented two sequential Gemini 2.5 Flash-Lite Google Search-grounded support/challenge calls; mapped evidence only from grounding support-to-source metadata; capped each claim/path at four sources; added deterministic Gemini-mode decomposition and synthesis; added graceful partial results; exposed the actual runtime model; and added visible free-tier privacy disclosure.
- Grounding compliance: Added the Search Suggestions HTML returned by Gemini grounding metadata to typed analysis/challenge results and the Evidence Map UI. Grounded evidence is withheld when the required attribution is missing. Verified the current model ID, free-tier grounding support, pricing boundary, 30-day grounding retention, and attribution requirement against official Google AI documentation on 2026-07-17.
- Owner configuration: Confirmed by variable name only that Vercel Production contains encrypted `AI_PROVIDER`, `GEMINI_API_KEY`, and `GEMINI_MODEL`. Secret values were neither displayed nor added to the repository. The owner identified the dedicated Google project as `gen-lang-client-0175510817`.
- Commands/tests:
  - `npm run format` and `git diff --check` — PASS.
  - `npm run lint` — PASS.
  - `npm run typecheck` — PASS.
  - `npm test` — PASS; 15 files and 60 tests passed.
  - `npm run eval:golden` — PASS; all eight golden cases plus causal and cross-claim-label leakage controls passed.
  - `npm run build` — PASS; `/`, `/api/analyze`, `/api/challenge`, and `/api/demo` built successfully.
  - `npm audit` and `npm audit --omit=dev` — PASS; 0 vulnerabilities.
- Result: Local release gates pass. Milestone 10 remains `IN PROGRESS` pending the GitHub push, production deployment, signed-out live smoke, public video, `/feedback` Session ID, and Devpost submission.
- Next: Commit and push the Gemini release, wait for Vercel Production, then run the live judge input, Search Suggestions, challenge, curated demo, SSRF, and security-header smoke tests.

### 2026-07-17 — Milestone 10 Gemini production quota verification

- Production deployments: Pushed the Gemini provider and safe diagnostics to public `main`; Vercel repeatedly built the commits successfully and kept <https://falsify-mu.vercel.app/> aliased to Ready production deployments.
- Verified provider boundary:
  - `gemini-2.5-flash-lite` — HTTP 404: no longer available to new users.
  - `gemini-3.1-flash-lite` with Google Search — HTTP 429 `RESOURCE_EXHAUSTED` on both support and challenge paths.
  - `gemini-3.1-flash-live-preview` with Google Search — WebSocket 1011 with the same quota-exhausted reason.
- Safety behavior: Every failed provider path returned HTTP 200 with `mode: sample`, zero invented evidence, `INSUFFICIENT_EVIDENCE`, and explicit limitations. API keys remained encrypted and server-side; sanitized authenticated logs exposed status/reason but redacted key patterns. Billing was not enabled.
- Final product posture: The public curated demo remains fully judge-testable without a model key or quota. The Gemini provider is implemented and deployment-configured, but fresh grounded search is not represented as live until Google supplies quota or the owner explicitly selects another funded/search provider.
- Commands/tests after the provider diagnostics and compatibility changes:
  - `npm run format`, `npm run lint`, and `npm run typecheck` — PASS.
  - `npm test` — PASS; 15 files and 61 tests passed.
  - `npm run build` — PASS.
- Result: `PARTIAL_PASS_OWNER_ACTION_REQUIRED`. Repository, curated public deployment, Gemini integration, fallback behavior, and disclosure pass. Milestone 10 remains `IN PROGRESS` for the public video, `/feedback` Session ID, Devpost submission, and any owner-selected live search funding/provider.
- Next: Re-deploy the simplified Gemini 3.1 Flash-Lite configuration, re-run the curated demo/security smoke, and then complete the owner-only submission steps.

### 2026-07-17 — Milestone 10 automated demo video package

- Work completed: Added a deterministic Playwright screen-tour script, a 1:45 English narration plan, an SRT caption file, and an SSML narration source. Generated a clean browser recording that stays entirely inside Falsify and opens no PDFs or external tabs. The tour covers the flagship Evidence Map, Claim 2's separate support/challenge columns, the inspectable finding, the adversarial re-check, the `qualified` outcome, and the new National Diet evidence.
- Video verification:
  - Automated WebM — PASS; 1:49.44, 1440×900, approximately 10 MB. Six sampled frames confirmed the expected sequence through the final counter-evidence.
  - English narration WAV — PASS; 1:34.74, generated from the checked-in SSML with a local Microsoft English system voice. This is AI-assisted narration, not an official OpenAI voice.
  - Clipchamp composition — PASS; clean WebM and narration were added to a new project without deleting the owner's rehearsal recording.
  - Final MP4 — PASS; 1080p export, 1:49, 116.54 MB, audio bit rate reported as 192 kbps. Clipchamp cloud saving was disabled; no OneDrive or other external upload was performed.
- Local deliverable: `C:\Users\Windows\Downloads\Falsify-OpenAI-Build-Week-Demo.mp4`.
- Repository assets: `scripts/record-demo.mjs`, `docs/DEMO_SCRIPT_90S.md`, `docs/demo-90s.srt`, and `docs/demo-90s-narration.ssml`.
- Repository checks: `node --check scripts/record-demo.mjs`, Prettier, `npm run lint`, `npm run typecheck`, all 15 test files / 61 tests, and `git diff --check` — PASS. A first combined validation command exceeded the shell time limit before returning output; the same checks passed when rerun individually and sequentially.
- Result: The submission video exists locally and is under the three-minute limit. Milestone 10 remains `IN PROGRESS` until owner review, public YouTube publication, the primary Codex `/feedback` Session ID, and Devpost submission are complete.
- Next: Review the final MP4 once end to end, then publish it to YouTube and record the public URL in the submission package.

### 2026-07-17 — Milestone 10 submission-video disclosure correction

- Requirement correction: The public Build Week video must explain in audio how both Codex and GPT-5.6 were used. The first export named Codex but did not explicitly describe the GPT-5.6 product path.
- Work completed: Added a 14.39-second English closing narration sourced from `docs/demo-codex-gpt56-tag.ssml`. It states that Codex drove the architecture, implementation, testing, and deployment, while the typed GPT-5.6 Responses API path performs claim decomposition, separate evidence searches, and finding synthesis.
- Clipchamp verification: Placed the closing narration at 1:34 without extending the 1:49 video. Exported at 1080p with cloud saving disabled.
- Corrected local deliverable: `C:\Users\Windows\Downloads\Falsify-OpenAI-Build-Week-Demo-v2.mp4`; 1:49, 116.54 MB, audio bit rate reported as 192 kbps. The v2 SHA-256 differs from the first export, confirming a new rendered artifact.
- Result: The corrected video now covers Codex and GPT-5.6 in its audio and remains under the three-minute limit. Milestone 10 remains `IN PROGRESS` until owner review, public YouTube publication, the primary Codex `/feedback` Session ID, and Devpost submission are complete.
- Next: Review the v2 MP4, upload it to YouTube as `Public`, then record the public URL in the submission package.

### 2026-07-18 — Milestone 10 general-public narration revision

- Editorial review: The prior narration was factually defensible and submission-compliant, but it read like a technical requirements walkthrough. It used defensive phrasing and introduced the product through labels rather than the public value of an inspectable evidence map.
- Work completed: Rewrote the complete English narration in affirmative, plain-language terms; opened with the product's support/challenge/uncertainty value; explained the Japanese-language case through the observable workflow; retained the falsification question, separate evidence columns, provenance, uncertainty, and self-challenge; and integrated the Codex/GPT-5.6 disclosure into the closing. Political neutrality is demonstrated by the method rather than asserted in a spoken disclaimer.
- Runtime accuracy: The narration says the demonstration uses curated public sources and that a typed GPT-5.6 Responses API path was implemented. The repository and YouTube description retain the fuller disclosure that production has no OpenAI key.
- Audio verification: Generated a 219-word Microsoft Mark TTS track from `docs/demo-90s-narration.ssml`; 105.905 seconds, mono, 22.05 kHz, 16-bit. Long-silence analysis placed all nine narration sections within approximately two seconds of the previous synchronized section starts. Updated `docs/demo-90s.srt` to match the spoken text and measured section timings.
- Clipchamp composition: Created a new project rather than deleting or overwriting the earlier project. Added only `Falsify-Build-Week-clean.webm` and `Falsify-Build-Week-narration-public-v2.wav`. Exported at 1080p with cloud saving disabled; Clipchamp reported 1:49 and 116.54 MB.
- Corrected local deliverable: `C:\Users\Windows\Downloads\Falsify-OpenAI-Build-Week-Demo-public-v3.mp4`. The file exists locally at 116,540,505 bytes, reports 192 kbps audio, and has a SHA-256 distinct from v2.
- Result: The general-public video candidate is rendered and under three minutes. Milestone 10 remains `IN PROGRESS` until owner playback review, public YouTube publication, the primary Codex `/feedback` Session ID, and Devpost submission are complete.
- Next: Review the public-v3 MP4 end to end, then publish it publicly on YouTube and record the URL.

### 2026-07-18 — Milestone 10 public YouTube release

- Publication: Published `Falsify — Inspect the Evidence Behind Every Claim` publicly at <https://youtu.be/hht1DsS66n0> on the `Takahiro Tsuchiya | TSUCHIYA LAB` channel.
- Upload verification: YouTube reports a 1:50 duration, `Public` visibility, no instant Premiere or schedule, and `No issues found` in the copyright check. The opening Falsify frame is the thumbnail, the audience is set to not made for kids, the AI-use disclosure is enabled for TTS narration, and English timed captions were uploaded from `docs/demo-90s.srt`.
- Metadata: The evergreen title and description link the live demo and public repository, disclose the curated public-source demonstration, and describe the implemented typed GPT-5.6 Responses API path without presenting the quota-bound Gemini deployment as GPT-5.6.
- External verification: A direct unauthenticated request resolved the public short URL to the YouTube watch page with the expected title.
- Result: The public under-three-minute video requirement is complete. Milestone 10 remains `IN PROGRESS` only for the primary Codex `/feedback` Session ID, final signed-out link sweep, Devpost owner/team fields, and submission.
- Next: Run `/feedback` in this primary build task, record the Session ID, then complete and submit the prepared Devpost entry.

### 2026-07-18 — Milestone 10 primary Codex Session ID

- Work completed: Ran `/feedback` in the primary Codex build task and captured the Session ID required by the Build Week submission form.
- Privacy boundary: Both the current conversation log and browser-tab/browser-log attachments were excluded from the feedback submission. The Session ID is retained privately for direct entry into Devpost and is intentionally not committed to the public repository.
- Result: The primary-session requirement is ready for submission. Milestone 10 remains `IN PROGRESS` for the final signed-out public-link sweep, owner/team fields, and Devpost submission.
- Next: Open the Devpost submission form, paste the prepared fields and privately retained Session ID, confirm `Work & Productivity`, and submit after the final review.
