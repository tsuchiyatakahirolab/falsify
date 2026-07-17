# Judge Guide

## Fastest path

Time required: about 60 seconds. No login or API key is required for this path.

1. Open `<PUBLIC_DEMO_URL>`.
2. Select **Load flagship public-source demo**.
3. Read the four-item Claim Map:
   - Claim 1 preserves the supported official FY2026 draft budget proposal and planned-capability fact while distinguishing it from final Diet enactment.
   - Claim 2 separates that fact from the stronger pre-1945 historical analogy.
   - Claims 3 and 4 apply the same intent-evidence standard to the original claim and the rebuttal.
4. In Claim 2, inspect support and contradictory/qualifying evidence and the explicit unresolved questions.
5. Select **Challenge this finding**.
6. Confirm that the re-check is **QUALIFIED**, keeps both the original and revised verdict visible, and introduces the National Diet research report as new counter-evidence.

## What this demonstrates

- The primary visual object is the claim and its evidence chain, not a chat transcript.
- Support search and challenge search are separate evidence paths.
- Supported factual cores survive even when a broader inference does not.
- Adversarial framing is not dismissed merely because it is adversarial.
- Deceptive intent is not inferred from disagreement or outcome alone.
- Falsify's own finding can be challenged and qualified.

## Live path

The deployed app should have `OPENAI_API_KEY` configured server-side. Paste a short evidence-dependent passage and select **Falsify this claim**. A live result is labeled **Live GPT-5.6 analysis**. If the deployment is intentionally running without a key, Falsify returns a visibly limited local result and does not invent web evidence.

Suggested live input:

> A 2026 report says Japan's defense budget increased by 12%. This alone proves a revival of pre-war militarism.

Expected behavior: separate the quantitative premise from the analogy, show falsification questions, keep both evidence paths explicit, and avoid treating a missing source as proof of falsity.

## Verification references

- Golden results: `evals/RESULTS.md`
- Build/test history: `DOCUMENTATION.md`
- Security/privacy: `docs/SECURITY_PRIVACY.md`
- Source-set notes: `docs/research/flagship-china-japan-narrative-source-set.md`

## Known boundary

The repository is release-validated locally, but `<PUBLIC_DEMO_URL>`, `<PUBLIC_REPOSITORY_URL>`, and the live GPT-5.6 smoke result must be filled by the owner after deployment.
