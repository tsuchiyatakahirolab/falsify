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

Falsify is a single Next.js/TypeScript application. GPT-5.6 is used through the OpenAI Responses API and Structured Outputs for typed claim decomposition and finding synthesis. Hosted web search runs on two deliberately separate paths. Evidence URLs are accepted only when the same response includes an official URL citation annotation. Deterministic audit observations remain binding inputs to the synthesis.

The public URL path is hardened against SSRF with DNS validation and socket pinning on every redirect, plus strict time, byte, port, and body limits. The application is stateless and has no database in the MVP.

### How Codex was used

Codex was the primary implementation environment for the majority of the core project: architecture, domain schemas, GPT-5.6 integration, evidence provenance, deterministic audits, Evidence Map UI, challenge flow, security hardening, tests, evals, and release documentation. The primary task retained integration ownership. Bounded helper agents contributed only independent research, evaluation, and security-review findings, which were rechecked and integrated in the main build task.

### Challenges

The hardest problem was maintaining epistemic symmetry while keeping the product useful. A real source can establish a budget increase without establishing the historical or intentional claim layered on top of it. We also had to prevent structurally valid model output from inventing plausible sources, which led to strict URL-citation allowlisting.

### Accomplishments

- Complete claim-to-evidence-to-challenge user flow.
- Four-claim symmetric public-source flagship demo.
- 55 passing tests across 12 files.
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
- Public YouTube video: `<PUBLIC_YOUTUBE_URL>`
- Codex `/feedback` Session ID: `<PRIMARY_CODEX_FEEDBACK_SESSION_ID>`
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
