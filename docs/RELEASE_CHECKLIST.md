# Release Checklist

Status date: 2026-07-17.

## Completed in repository

- [x] Claim decomposition, falsification questions, separate evidence paths, audits, findings, and adversarial re-check are implemented.
- [x] Flagship demo uses public sources and symmetric intent standards.
- [x] No global credibility score or ungrounded disinformation label.
- [x] Source provenance and uncertainty are visible.
- [x] Strict runtime schemas and public JSON Schemas are tested.
- [x] Prompt-injection boundary, server-only key, ephemeral processing, input limits, SSRF controls, quotas, timeouts, safe errors, and security headers are implemented.
- [x] `npm ci`, format, lint, typecheck, regression tests, golden eval, dependency audit, and production build pass.
- [x] Desktop and mobile browser smoke pass; screenshots are captured.
- [x] MIT license is present.
- [x] README, judge guide, deployment guide, Devpost draft, and demo script are prepared.
- [x] No proprietary/private Tsuchiya Lab data or services are included.
- [x] GitHub CLI and Vercel CLI owner sessions are authenticated on the release machine.

## Owner actions required

- [x] Create and push the public GitHub repository: <https://github.com/tsuchiyatakahirolab/falsify>.
- [x] Deploy the public curated demo: <https://falsify-mu.vercel.app/>.
- [x] Add the server-side `GEMINI_API_KEY`, `AI_PROVIDER=gemini`, and `GEMINI_MODEL=gemini-2.5-flash-lite` to Vercel Production.
- [ ] Run and record the deployed Gemini support/challenge grounding smoke in `DOCUMENTATION.md`.
- [ ] If OpenAI credits or billing become available, run and record the optional deployed GPT-5.6 path; do not block the zero-cost public demo on it.
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
