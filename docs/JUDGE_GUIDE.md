# Judge Guide

## Fastest path

Time required: about 60 seconds. No login or API key is required for this path.

1. Open <https://falsify-mu.vercel.app/>.
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

The deployed public app uses Gemini 2.5 Flash-Lite for two independent Google Search-grounded evidence paths. Paste a short evidence-dependent passage and select **Falsify this claim**. A successful result is labeled **Live analysis · gemini-2.5-flash-lite**. Claim decomposition and finding audits are deterministic in this quota-conserving public mode. If a free-tier path is rate-limited, Falsify returns a visibly partial result and does not invent web evidence.

Suggested live input:

> A 2026 report says Japan's defense budget increased by 12%. This alone proves a revival of pre-war militarism.

Expected behavior: separate the quantitative premise from the analogy, show falsification questions, keep both evidence paths explicit, and avoid treating a missing source as proof of falsity.

## Verification references

- Golden results: `evals/RESULTS.md`
- Build/test history: `DOCUMENTATION.md`
- Security/privacy: `docs/SECURITY_PRIVACY.md`
- Source-set notes: `docs/research/flagship-china-japan-narrative-source-set.md`

## Known boundary

The public curated path is the most reliable judge path and is release-validated. The repository retains the GPT-5.6 Responses API implementation, but the Build Week promotional credits were exhausted and production has no `OPENAI_API_KEY`. The live public runtime is explicitly labeled Gemini rather than being represented as GPT-5.6. Free-tier Gemini processing is not suitable for confidential material. Source: <https://github.com/tsuchiyatakahirolab/falsify>.
