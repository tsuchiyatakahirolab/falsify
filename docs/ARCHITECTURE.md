# Architecture

This is a preferred minimal architecture, not permission to over-engineer.

## Recommended shape

```text
Browser
  |
  v
Next.js / TypeScript web app
  |
  +-- Input normalization
  +-- Server-side analysis orchestration
  |      |
  |      +-- GPT-5.6 claim decomposition
  |      +-- Support evidence path
  |      +-- Contradiction evidence path
  |      +-- Audit / synthesis
  |      +-- Adversarial re-check
  |
  +-- Deterministic utilities
  |      +-- date checks
  |      +-- number extraction/comparison
  |      +-- URL/source metadata checks
  |
  +-- Typed schemas / validation
  |
  v
Evidence Map UI
```

## OpenAI integration

Preferred:
- Responses API;
- GPT-5.6;
- Structured Outputs for typed claim/evidence/finding objects;
- web search for current public evidence where appropriate.

Official references:
- https://developers.openai.com/api/docs
- https://developers.openai.com/api/docs/guides/tools-web-search
- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/models/gpt-5.6-sol

## Model-role separation

Logical roles may be implemented as separate calls, tool stages, or subagent-like reasoning paths:

1. **Claim Decomposer**
2. **Support Investigator**
3. **Adversarial Investigator**
4. **Evidence Auditor**
5. **Finding Synthesizer**
6. **Re-check Challenger**

Do not create agent complexity for its own sake. The separation matters because support-seeking and contradiction-seeking should not collapse into one confirmation-biased pass.

## Structured data

Use repository schemas under `schemas/`. Runtime validation is required.

## Persistence

MVP preference:
- ephemeral server processing;
- no default permanent storage of uploaded manuscripts;
- optional browser-local history only if safe and useful;
- no database unless required by a concrete shipped feature.

## Deployment

Prefer a deployment path that:
- provides an immediately testable public URL;
- protects server secrets;
- supports reasonable request timeouts;
- allows rate limiting;
- requires minimal judge setup.

## Cost control

- cap input size;
- cap number of claims analyzed by default;
- allow user selection of claims for deeper audit;
- parallelize independent evidence work when safe;
- cache only non-sensitive public-source results if implemented;
- provide a precomputed sample demo for fallback while retaining a genuinely live path.

## Failure states

The UI must represent:
- source unavailable;
- insufficient evidence;
- search timeout;
- partial result;
- model/schema failure;
- unsupported file;
- request quota exceeded.

Never silently convert a failure into a confident verdict.
