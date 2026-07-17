# Devpost Submission Draft

Official requirements rechecked: 2026-07-17.

## Project name

Falsify

## Tagline

Don't trust the answer. Inspect its evidence.

## Track

**Work & Productivity**

Falsify improves evidence-dependent professional work for researchers, analysts, journalists, and policy teams. It turns a complex argument into an inspectable workflow for testing claims, sources, inferences, and rebuttals.

## Short description

Falsify is an open-source adversarial evidence verification tool. It decomposes an argument into atomic claims, asks what would make each claim fail, searches separately for supporting and challenging evidence, audits citation and inference fit, and lets users challenge Falsify's own finding. It avoids global credibility scores and does not infer deceptive intent without evidence.

## Full description

### Inspiration

Evidence-heavy work often fails in the gap between a real fact and the conclusion built on top of it. Existing AI tools are good at summarizing sources and finding support; fewer are designed to search for the strongest reason an argument should be narrowed or rejected.

### What it does

Falsify turns a passage, public URL, or text document into an Evidence Map. It:

- decomposes the input into atomic, typed claims;
- generates explicit falsification questions and evidence requirements;
- runs separate support and contradiction searches;
- preserves source URL, title, publisher, date, relevance, and directness;
- audits dates, numbers, source fit, causality, selective context, historical analogy, and attribution of intent;
- produces claim-level, qualified findings with visible uncertainty;
- runs an adversarial re-check against its own finding.

The flagship demo tests a China-to-Japan defense narrative using symmetric standards. It preserves the supported fact that Japan's Ministry of Defense published a record-scale FY2026 draft defense budget proposal with planned capability investment, explicitly distinguishes that proposal from final Diet enactment, separates it from a stronger historical analogy, and requires independent evidence for both sides' claims about deceptive intent.

### How we built it

Falsify is a single Next.js/TypeScript application. The repository implements GPT-5.6 through the OpenAI Responses API and Structured Outputs for typed claim decomposition, two hosted-search paths, finding synthesis, and adversarial re-check. Because the Build Week promotional credits were exhausted before allocation, the public deployment also includes a transparent Gemini 3.1 Flash-Lite integration for two Google Search-grounded evidence paths, with deterministic decomposition and audits to conserve quota. The new Google project's free Search-grounding quota is currently zero, so the reliable zero-cost judge path is the curated public-source demo and fresh submissions fall back without invented evidence. OpenAI URLs are accepted only from official URL citation annotations; Gemini URLs and titles are accepted only from grounding metadata. The interface always exposes the actual runtime model.

The public URL path is hardened against SSRF with DNS validation and socket pinning on every redirect, plus strict time, byte, port, and body limits. The application is stateless and has no database in the MVP.

### How Codex was used

Codex was the primary implementation environment for the majority of the core project: architecture, domain schemas, GPT-5.6 integration, evidence provenance, deterministic audits, Evidence Map UI, challenge flow, security hardening, tests, evals, and release documentation. The primary task retained integration ownership. Bounded helper agents contributed only independent research, evaluation, and security-review findings, which were rechecked and integrated in the main build task.

### Challenges

The hardest problem was maintaining epistemic symmetry while keeping the product useful. A real source can establish a budget increase without establishing the historical or intentional claim layered on top of it. We also had to prevent structurally valid model output from inventing plausible sources, which led to strict URL-citation allowlisting.

### Accomplishments

- Complete claim-to-evidence-to-challenge user flow.
- Four-claim symmetric public-source flagship demo.
- 61 passing tests across 15 files.
- 8/8 golden audit cases plus causal and cross-claim-label leakage controls.
- Strict structured-output validation and citation provenance.
- Public-input hardening, quotas, sanitized errors, and security headers.
- Responsive Evidence Map verified at desktop and mobile widths.

### What we learned

“Fact checking” is too coarse for many real arguments. The most useful unit is often the transition from evidence to inference. It is also not enough to make model output explainable; the explanation itself needs a supported challenge path.

### What's next

Future work could add exact-passage extraction for richer document types, shared platform-level quotas, user-supplied counter-evidence, and exported audit bundles. These are deliberately outside the Build Week MVP until the core evidence method is validated.

## Submission fields

- Public demo: <https://falsify-mu.vercel.app/>
- Code repository: <https://github.com/tsuchiyatakahirolab/falsify>
- Public YouTube video: <https://youtu.be/hht1DsS66n0>
- Codex `/feedback` Session ID: Captured privately; paste the saved ID directly into the Devpost form.
- License: MIT
- Testing instructions: `docs/JUDGE_GUIDE.md`

## Official requirement snapshot

- Deadline: July 21, 2026 at 5:00 PM PDT / July 22 at 9:00 AM JST.
- Working project built with Codex and GPT-5.6.
- One category, project description, and repository/testing access.
- Public YouTube demo under three minutes with audio covering both Codex and GPT-5.6 use.
- README with setup, sample/testing guidance, Codex decisions, and GPT-5.6 use.
- Primary Codex `/feedback` Session ID.

Sources: <https://openai.devpost.com/> and <https://openai.devpost.com/rules>.
