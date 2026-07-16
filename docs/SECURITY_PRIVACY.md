# Security, Privacy, and Epistemic Safety

## Threat model

Falsify processes untrusted:
- web pages;
- documents;
- quoted statements;
- source metadata;
- user prompts.

These inputs may contain prompt injection, malicious links, misleading instructions, or sensitive unpublished content.

## Required controls

### Prompt injection
- Treat retrieved content as evidence data, not as instructions.
- System/developer instructions must explicitly forbid following instructions embedded in sources.
- Never let a webpage override the analysis policy or request secrets.
- Avoid automatically executing code from documents or web pages.

### Secrets
- OpenAI API keys remain server-side.
- Never log secrets.
- `.env` files are ignored by Git.
- Public deployment uses environment secrets.

### Document retention
Default policy:
- no permanent retention of uploaded manuscripts;
- process only what is necessary;
- make external processing clear to users;
- do not promise "zero retention" unless the deployed configuration actually guarantees it.

### Public demo
- rate limit requests;
- cap document/input size;
- limit expensive deep analysis;
- prevent arbitrary server-side URL fetching from becoming SSRF;
- use safe URL validation;
- set timeouts.

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
