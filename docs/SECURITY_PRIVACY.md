# Security, Privacy, and Epistemic Safety

## Threat model

Falsify processes untrusted:
- web pages;
- documents;
- quoted statements;
- source metadata;
- user prompts.

These inputs may contain prompt injection, malicious links, misleading instructions, or sensitive unpublished content.

## Implemented controls

### Prompt injection
- Treat retrieved content as evidence data, not as instructions.
- System/developer instructions must explicitly forbid following instructions embedded in sources.
- Never let a webpage override the analysis policy or request secrets.
- Avoid automatically executing code from documents or web pages.

### Secrets
- Gemini and OpenAI API keys remain server-side.
- Never log secrets.
- `.env` files are ignored by Git.
- Public deployment uses environment secrets.

### Document retention
Default policy:
- no permanent retention of uploaded manuscripts;
- process only what is necessary;
- make external processing clear to users;
- do not promise "zero retention" unless the deployed configuration actually guarantees it.

Live analysis sends submitted content to the configured model/search provider (Gemini or OpenAI). Provider data-use and retention policies apply in addition to this application's behavior; check the terms for the account and service actually deployed. Falsify has no permanent manuscript database and does not intentionally persist submitted documents. Use public or non-confidential material in a shared deployment.

The July 2026 deployment used Gemini Developer API and Google Search grounding. A production check on 1 November 2026 again selected Gemini and returned a limited result because both search paths reached quota/rate limits. The dated checks in [DOCUMENTATION.md](../DOCUMENTATION.md) distinguish the working saved example from unavailable fresh evidence retrieval. The release did not change provider credentials or billing, and these checks do not establish provider retention settings.

The UI renders Google Search Suggestions returned in server-side Gemini grounding metadata, subject to the application's CSP. Markdown and JSON downloads exclude this presentation HTML and preserve the source records, limitations, original findings, and latest re-check separately. Exported files include the submitted text and are saved only when the user chooses to download them; users control their subsequent storage and sharing.

### Public demo
- API bodies, source downloads, input text, and GPT output are bounded.
- Analysis and challenge routes have best-effort per-instance quotas with `Retry-After` responses.
- Public URL retrieval rejects credentials, non-default ports, local/private/reserved addresses, and mixed public/private DNS results.
- Every redirect is revalidated and the approved DNS address is pinned into the outbound socket lookup to prevent rebinding between validation and connection.
- Redirects, total wall time, and streamed bytes are capped; compressed transfer is not requested.
- API errors use stable public codes and do not expose raw upstream/internal messages.
- API responses are `no-store`; the application sends CSP, HSTS in production, frame denial, `nosniff`, a restrictive referrer policy, and a permissions policy.

Residual limitation: the limiter is in-memory and per application instance. A sustained public service should add platform-level or shared-store enforcement.

## Epistemic safety

### No truth oracle
Falsify must not present model output as final truth.

### No intent inference by default
A false or misleading claim is not automatically "disinformation." Deceptive intent is a separate evidentiary claim.

### Symmetric scrutiny
Apply the same evidentiary standards to:
- original claim;
- counterclaim;
- rebuttal;
- Falsify's own finding.

### Source hierarchy is contextual
Prefer primary sources for what an actor officially said or did. Do not assume an official source is automatically authoritative about contested facts outside its own actions.

### Uncertainty
Use explicit unresolved states. Missing evidence is not evidence of falsity.

### Political/national framing
Do not encode country-level moral or credibility scores. The China-to-Japan demo should expose evidence quality and inferential structure, not assign collective guilt or trustworthiness.

## Research-data separation

Do not copy proprietary or protected Tsuchiya Lab assets into this public repository.

Do not treat SPReAD participant/user data as available to Falsify. Any future research use of user corrections or interaction logs requires a separately designed consent, governance, and ethics process.
