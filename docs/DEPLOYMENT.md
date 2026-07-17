# Deployment Guide

The minimal release target is Vercel because Falsify is a standard Next.js application with server routes and no database.

## Prerequisites

- A public GitHub repository containing this commit history.
- A Vercel account connected to that repository.
- A server-side Gemini API key for the zero-cost public live path, or an OpenAI API key for the optional GPT-5.6 path.

## Vercel deployment

1. Import the public repository into Vercel.
2. Keep the detected framework preset as **Next.js**.
3. Use `npm run build`; no custom output directory is required.
4. Add encrypted production environment variables:
   - `AI_PROVIDER=gemini`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL=gemini-2.5-flash-lite`
5. Deploy the production branch.
6. Record the resulting URL in `README.md`, `docs/JUDGE_GUIDE.md`, `docs/DEVPOST_SUBMISSION.md`, and `docs/RELEASE_CHECKLIST.md`.

Never add `GEMINI_API_KEY` or `OPENAI_API_KEY` to Git, a `NEXT_PUBLIC_` variable, client code, screenshots, or demo video.

Optional GPT-5.6 deployment variables are `AI_PROVIDER=openai`, `OPENAI_API_KEY`, and `OPENAI_MODEL=gpt-5.6`. ChatGPT/Codex subscriptions do not fund Platform API calls.

## Required post-deploy smoke

1. Open the production URL in a signed-out browser.
2. Load the flagship sample and challenge Claim 2.
3. Submit the suggested live input from `docs/JUDGE_GUIDE.md`.
4. Confirm the result badge says **Live analysis · gemini-2.5-flash-lite**, both evidence paths are visible, sources are clickable, and no raw error is exposed.
5. Confirm `/api/demo` returns HTTP 200 with `Cache-Control: no-store`.
6. Confirm the home page includes CSP, HSTS, `nosniff`, and frame-denial headers.
7. Submit a loopback URL such as `http://127.0.0.1/` and confirm the API returns safe HTTP 422 `PRIVATE_NETWORK_BLOCKED`.
8. Check desktop and mobile layouts and browser console errors.

## Operational note

The included rate limiter is per application instance and trusts only Vercel's client-IP header. Before sustained traffic, configure Vercel Firewall/rate limiting or replace it with a shared limiter. Gemini free-tier quotas are project/model scoped and may return a graceful partial result during bursts.

## Self-hosted production check

```bash
npm ci
npm run build
npm run start
```

Set the same server-only environment variables in the hosting platform. Outbound HTTPS access to the selected model provider and public evidence sources is required for live mode.
