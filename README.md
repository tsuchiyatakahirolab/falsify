# Falsify

**Open-source adversarial evidence verification for research, public claims, and strategic narratives.**

> Don't trust Falsify. Inspect its evidence.

Falsify is a new OpenAI Build Week project. It is designed to decompose evidence-dependent statements into testable claims, identify what would make those claims fail, search for supporting and contradictory evidence, inspect citation fit, and expose where an inference goes beyond the available evidence.

Falsify is **not** an AI peer reviewer, a truth oracle, or a political scoring system. It should not decide whether an entire paper, institution, country, or person is "credible." Its job is narrower: make the evidentiary chain inspectable claim by claim.

## Why this exists

Most AI research tools help users find support, summarize sources, or strengthen an argument. Falsify deliberately adds an adversarial step:

1. What exactly is the claim?
2. What evidence would be required for it to hold?
3. What would make it wrong or require qualification?
4. Does the cited evidence directly support the claim?
5. Is there credible contradictory evidence?
6. Does the conclusion go beyond what the evidence establishes?

The output should preserve uncertainty and distinguish factual disagreement from interpretive disagreement.

## Build Week scope

The hackathon MVP is intentionally narrow:

- ingest a pasted statement, URL, or supported document;
- extract atomic, testable claims;
- generate explicit falsification questions;
- retrieve and separate supporting and contradictory evidence;
- prefer primary and authoritative sources where available;
- audit citation fit, dates, numbers, and inferential leaps where feasible;
- render an inspectable Evidence Map and Claim Cards;
- support an adversarial re-check of Falsify's own conclusion;
- provide one strong strategic-narrative demo involving public claims about Japan without hard-coding a politically predetermined verdict.

See `docs/SCOPE_LOCK.md`.

## First flagship use case

The first deep demonstration is a **China-to-Japan narrative audit**. Public claims concerning Japan may combine verifiable facts, selective context, historical analogy, attribution of intent, normative criticism, and causal claims. Falsify should separate those layers and test each with the same evidentiary standard.

The public engine remains general-purpose. It must also work for research papers, policy reports, journalism, corporate claims, and other evidence-dependent arguments.

## Core principles

- **Symmetric standards.** The same method applies to the original claim and to the rebuttal.
- **No forced TRUE/FALSE binary.** Use qualified verdicts tied to evidence.
- **No intent inference by default.** "Disinformation" requires evidence of deceptive intent; otherwise describe the observable information problem.
- **Primary-source preference.** Prefer official, original, or first-party evidence when appropriate, while allowing credible secondary evidence.
- **Traceability.** Every meaningful finding should link claim → evidence → source → exact supporting passage or structured source record.
- **Falsifiability.** Users must be able to challenge Falsify's own finding.
- **Human judgment remains visible.** Domain expertise and unresolved ambiguity are first-class outcomes.
- **Privacy by design.** Do not permanently retain user manuscripts by default.
- **Open core.** Public repository, open-source license, reproducible evals, and self-hosting path.

## Project status

**Milestone 0 complete.** The Next.js application baseline and evidence-first landing page are runnable. Live claim analysis is not connected yet; implementation is proceeding milestone by milestone from `PLANS.md`.

Read the project guidance in this order:

1. `AGENTS.md`
2. `docs/PROJECT_CHARTER.md`
3. `docs/SCOPE_LOCK.md`
4. `docs/PRODUCT_SPEC.md`
5. `docs/ARCHITECTURE.md`
6. `docs/SECURITY_PRIVACY.md`
7. `docs/EVALUATION_PLAN.md`
8. `PLANS.md`
9. `IMPLEMENT.md`

## Local development

Prerequisites:

- Node.js 20.9 or newer;
- npm 10 or newer;
- an OpenAI API key once the live analysis milestones are enabled.

Install and start the application:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`.
Open [http://localhost:3000](http://localhost:3000). The Milestone 0 landing page does not require an API key.

Quality checks:

```bash
npm run lint
npm run typecheck
npm test
npm run format
npm run build
```

Environment variables are documented in `.env.example`. `OPENAI_API_KEY` is server-only and must never use a `NEXT_PUBLIC_` prefix.

## Relationship to Tsuchiya Lab products

Falsify is the **open-source public verification layer**, not a replacement for other independent products.

- **XINAPI**: evidence/source intelligence and China-analysis SaaS/API.
- **NARRAPI**: narrative structure and transformation analysis.
- **QUNAPI**: affect and resonance analysis.
- **TL Veilfin**: scenario and risk exploration.
- **TL Archer**: evidence-bound drafting.
- **TL Discus**: review, deliberation, rebuttal, and peer-review simulation.
- **TL Pilotfish**: internal Growth Operator and distribution support.
- **CMCF, CDPAT, GQSO, CONPD/JNOM, PMAA, CLFEA**: specialized research/data assets with separate governance.

See `docs/RELATIONSHIPS.md`.

## OpenAI Build Week

This project is being built for OpenAI Build Week 2026 using Codex and GPT-5.6. The submission repository must document how Codex accelerated development, where key decisions were made, and how GPT-5.6 is used in the working product.

Official submission guidance:
- https://openai.devpost.com/updates/45282-openai-build-week-submissions-are-open-plugin-launch
- https://openai.devpost.com/rules
- https://openai.devpost.com/details/faqs

## License

MIT. See `LICENSE`.
