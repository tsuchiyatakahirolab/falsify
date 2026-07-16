# DOCUMENTATION.md — Build Status and Decision Log

Keep this file current throughout the build.

## Current status

- Project: Falsify
- Phase: Implementation
- Current milestone: Milestone 1
- Public demo: Not deployed
- Repository: Milestone 0 application baseline complete
- Primary Codex `/feedback` Session ID: Not captured
- Submission status: Devpost draft

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
