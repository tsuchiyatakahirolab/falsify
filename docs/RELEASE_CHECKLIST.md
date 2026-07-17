# Release Checklist

Status date: 2026-07-17.

## Completed in repository

- [x] Claim decomposition, falsification questions, separate evidence paths, audits, findings, and adversarial re-check are implemented.
- [x] Flagship demo uses public sources and symmetric intent standards.
- [x] No global credibility score or ungrounded disinformation label.
- [x] Source provenance and uncertainty are visible.
- [x] Strict runtime schemas and public JSON Schemas are tested.
- [x] Prompt-injection boundary, server-only key, ephemeral processing, input limits, SSRF controls, quotas, timeouts, safe errors, and security headers are implemented.
- [x] `npm ci`, format, lint, typecheck, 55 tests, golden eval, dependency audit, and production build pass.
- [x] Desktop and mobile browser smoke pass; screenshots are captured.
- [x] MIT license is present.
- [x] README, judge guide, deployment guide, Devpost draft, and demo script are prepared.
- [x] No proprietary/private Tsuchiya Lab data or services are included.
- [x] GitHub CLI and Vercel CLI owner sessions are authenticated on the release machine.

## Owner actions required

- [ ] Create and push the public GitHub repository; fill `<PUBLIC_REPOSITORY_URL>`.
- [ ] Deploy production with server-side `OPENAI_API_KEY` and `OPENAI_MODEL=gpt-5.6`; fill `<PUBLIC_DEMO_URL>`.
- [ ] Run and record the deployed live GPT-5.6/web-search smoke in `DOCUMENTATION.md`.
- [ ] Configure platform-level rate/spend protection appropriate to expected traffic.
- [ ] Record the under-three-minute demo, upload it publicly to YouTube, and fill `<PUBLIC_YOUTUBE_URL>`.
- [ ] Run `/feedback` in this primary Codex build task and fill `<PRIMARY_CODEX_FEEDBACK_SESSION_ID>`.
- [ ] Verify owner/team eligibility and add all accepted teammates in Devpost.
- [ ] Paste the prepared Devpost fields and confirm **Work & Productivity**.
- [ ] Recheck official rules immediately before submission.
- [ ] Test every public link in a signed-out browser.
- [ ] Submit before **July 21, 2026 5:00 PM PDT / July 22 9:00 AM JST**.

## Release decision codes

- `PASS`: repository, public deployment, live smoke, repo, video, feedback ID, and submission fields are all complete.
- `PARTIAL_PASS_OWNER_ACTION_REQUIRED`: repository release candidate passes; one or more credential/account/publication steps remain.
- `FAIL`: a core workflow, validation gate, rights boundary, or public safety control is broken.
