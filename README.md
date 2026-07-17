# Falsify

**Adversarial evidence verification for claims that should survive scrutiny.**

Falsify decomposes an argument into atomic claims, asks what would make each claim fail, searches separately for support and contradiction, audits the evidence-to-inference chain, and lets the user challenge Falsify's own finding.

It is not a chatbot, a paper-level credibility score, or a political truth oracle. Findings stay claim-level, source-linked, qualified, and inspectable.

**Public demo:** [falsify-mu.vercel.app](https://falsify-mu.vercel.app/) · **Source:** [github.com/tsuchiyatakahirolab/falsify](https://github.com/tsuchiyatakahirolab/falsify)

![Falsify Evidence Map](docs/assets/falsify-evidence-map-desktop.png)

## Judge path — 60 seconds, no API key required

1. Open the app and select **Load flagship public-source demo**.
2. See one narrative decomposed into four claims: a draft-budget proposal fact, a historical analogy, and two reciprocal intent attributions.
3. Inspect the separate supporting and contradictory/qualifying source paths.
4. Notice that the same `ATTRIBUTION_NOT_ESTABLISHED` standard is applied to both Chinese and Japanese intent claims.
5. On Claim 2, select **Challenge this finding**. The new National Diet evidence qualifies the analysis while preserving the unresolved historical threshold.

The curated sample is public-source, dated, and visibly labeled. It does not pretend to be a fresh live search. See [JUDGE_GUIDE.md](docs/JUDGE_GUIDE.md).

## What makes Falsify different

```text
claim decomposition
  → falsification questions
  → independent support search + challenge search
  → citation, date, number, source-fit, and inference audits
  → inspectable claim-level finding
  → adversarial re-check of Falsify itself
```

- No overall credibility score for a person, paper, institution, or country.
- No deceptive-intent label without separate evidence of intent.
- A real citation is not assumed to support the sentence that cites it.
- Missing evidence becomes an evidence gap, not an invented source or confident verdict.
- Public URLs and uploaded text are processed ephemerally; there is no database in the MVP.

## Live providers, OpenAI, and Codex use

The deployed fresh-search integration uses **Gemini 3.1 Flash-Lite** for two separate Google Search-grounded evidence paths when project quota is available. Claim decomposition and final audits remain deterministic in this quota-conserving mode. URLs and titles enter the evidence map only through Gemini grounding metadata; grounded summaries are labeled as summaries, not verified quotations. The UI also renders the Search Suggestions attribution supplied by Google's grounding metadata, as required by the [Google Search grounding documentation](https://ai.google.dev/gemini-api/docs/generate-content/google-search).

The current new Google project has a zero free-tier quota for Search grounding: Gemini 2.5 Flash-Lite returns `404` for new users, while Gemini 3.1 Flash-Lite returns `429 RESOURCE_EXHAUSTED` for grounded requests without billing. Falsify therefore keeps the curated public-source demo as the reliable zero-cost judge path and falls back without inventing evidence. Billing was not enabled.

The repository also retains the complete GPT-5.6 product path built for Build Week:

- `responses.parse` plus Structured Outputs decomposes the input into typed atomic claims and falsification questions;
- two separate GPT-5.6 web-search calls investigate supporting and challenging evidence;
- only URLs present in official `url_citation` annotations are admitted into the evidence set;
- GPT-5.6 synthesizes findings from the validated evidence bundle and deterministic audit observations;
- **Challenge this finding** runs a new counter-evidence search and records whether the original finding holds, qualifies, changes, or remains unresolved.

The Build Week promotional OpenAI credits were exhausted before this project could receive them, and the public deployment does not claim that its Gemini runtime is GPT-5.6. The UI always exposes the actual model. Self-hosters with OpenAI API billing or credits can select the GPT-5.6 path server-side.

Codex was the primary implementation environment for the majority of the core product. The main build task owned architecture, TypeScript schemas, Responses API integration, evidence provenance, UI, tests, security hardening, release validation, and documentation. Bounded helper agents were used only for source-set research, an evaluation matrix, and independent security review; their findings were integrated and verified in the primary task. Key decisions and exact test history are in [DOCUMENTATION.md](DOCUMENTATION.md).

## Architecture

Falsify is one TypeScript application:

```text
Next.js browser UI
  ├─ pasted text / public URL / client-read text document
  ├─ Evidence Map + Claim Cards
  └─ stateless challenge bundle
          │
Next.js server routes
  ├─ bounded input and public-URL normalization
  ├─ provider selection: Gemini public demo / optional GPT-5.6
  ├─ independent support and challenge grounded search
  ├─ grounding/citation allowlisting + deterministic audits
  ├─ qualified finding synthesis
  └─ adversarial re-check
```

There is no authentication, database, background queue, or proprietary evidence service in the MVP. The public engine uses only public or user-provided material.

## Run locally

Requirements: Node.js 20.9+ and npm 10+.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

On PowerShell, use `Copy-Item .env.example .env.local`. Open [http://localhost:3000](http://localhost:3000).

The one-click flagship sample works without an API key. For the Gemini fresh-search path when project Search-grounding quota is available, create a Google AI Studio key and set:

```dotenv
AI_PROVIDER=gemini
GEMINI_API_KEY=your_server_side_key
GEMINI_MODEL=gemini-3.1-flash-lite
```

For the optional GPT-5.6 path, set:

```dotenv
AI_PROVIDER=openai
OPENAI_API_KEY=your_server_side_key
OPENAI_MODEL=gpt-5.6
```

Never expose the key with a `NEXT_PUBLIC_` prefix.

Supported MVP input:

- pasted text up to 30,000 characters;
- a public HTTP(S) text/HTML/JSON URL;
- a client-read text document up to 200 KiB.

Documents are not uploaded to a permanent store. PDF/DOCX parsing is intentionally deferred.

## Validate

```bash
npm run format
npm run lint
npm run typecheck
npm test
npm run eval:golden
npm run build
```

Current release evidence:

- Gemini and OpenAI provider routing, grounding provenance, and fallback behavior are regression-tested;
- 8/8 golden audit cases pass, plus causal and cross-claim-label leakage controls;
- production build passes;
- dependency audit reports 0 vulnerabilities;
- browser smoke passes at 1280 px and 390 px with no console errors or horizontal overflow.

See [evals/RESULTS.md](evals/RESULTS.md) for the golden-case boundary and [DOCUMENTATION.md](DOCUMENTATION.md) for all milestone commands.

## API surface

- `POST /api/analyze` — normalize input and run the analysis pipeline.
- `POST /api/challenge` — re-check one finding using the validated prior analysis.
- `GET /api/demo` — return the versioned curated flagship fixture.

Responses are runtime-validated with strict Zod schemas. Public URL retrieval rejects private/local/reserved networks, validates and pins DNS for every redirect, and caps ports, redirects, time, and bytes. API bodies, model output, and best-effort per-instance quotas are bounded. See [SECURITY_PRIVACY.md](docs/SECURITY_PRIVACY.md).

## Limitations

- Model and web-search results can be incomplete or wrong; inspect linked sources.
- The public Gemini free tier has [project-level rate limits and pricing limits](https://ai.google.dev/gemini-api/docs/pricing). If a path is rate-limited, Falsify shows a partial result or the curated demo instead of inventing evidence.
- Gemini free-tier content may be used to improve Google products. [Google documents](https://ai.google.dev/gemini-api/docs/zdr) that Search-grounded prompts, contextual information, and outputs are retained for 30 days; do not submit confidential material.
- The curated demo is not a fresh search and includes English paraphrases of multilingual official material.
- Deterministic checks cover useful patterns, not every citation or statistical failure mode.
- The in-memory rate limiter is per application instance; sustained public traffic needs platform or shared-store enforcement.
- The public deployment is configured for Gemini 3.1 Flash-Lite and has no `OPENAI_API_KEY`; the new Google project's free Search-grounding quota is currently zero, so fresh text submissions fall back transparently while the curated evidence demo remains fully testable.
- Falsify does not establish deceptive intent unless evidence separately supports that attribution.

## Deploy and submit

- [Deployment guide](docs/DEPLOYMENT.md)
- [Independent judge guide](docs/JUDGE_GUIDE.md)
- [Sub-three-minute demo script](docs/DEMO_SCRIPT.md)
- [Devpost submission draft](docs/DEVPOST_SUBMISSION.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)

The intended Build Week track is **Work & Productivity**. Official requirements were rechecked on 2026-07-17; submission closes July 21, 2026 at 5:00 PM PDT (July 22 at 9:00 AM JST).

## Open-source and data boundaries

Falsify is MIT licensed. No proprietary Tsuchiya Lab database, private research asset, grant-funded code, confidential data, or closed API is required or included. See [RELATIONSHIPS.md](docs/RELATIONSHIPS.md) and [OPEN_SOURCE_GOVERNANCE.md](docs/OPEN_SOURCE_GOVERNANCE.md).

## License

[MIT](LICENSE)
