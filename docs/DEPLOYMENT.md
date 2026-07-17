# Deployment Guide

The minimal release target is Vercel because Falsify is a standard Next.js application with server routes and no database.

## Prerequisites

- A public GitHub repository containing this commit history.
- A Vercel account connected to that repository.
- A server-side OpenAI API key authorized for GPT-5.6 and hosted web search.

## Vercel deployment

1. Import the public repository into Vercel.
2. Keep the detected framework preset as **Next.js**.
3. Use `npm run build`; no custom output directory is required.
4. Add encrypted production environment variables:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL=gpt-5.6`
5. Deploy the production branch.
6. Record the resulting URL in `README.md`, `docs/JUDGE_GUIDE.md`, `docs/DEVPOST_SUBMISSION.md`, and `docs/RELEASE_CHECKLIST.md`.

Never add `OPENAI_API_KEY` to Git, a `NEXT_PUBLIC_` variable, client code, screenshots, or demo video.

## Required post-deploy smoke

1. Open the production URL in a signed-out browser.
2. Load the flagship sample and challenge Claim 2.
3. Submit the suggested live input from `docs/JUDGE_GUIDE.md`.
4. Confirm the result badge says **Live GPT-5.6 analysis**, sources are clickable, and no raw error is exposed.
5. Confirm `/api/demo` returns HTTP 200 with `Cache-Control: no-store`.
6. Confirm the home page includes CSP, HSTS, `nosniff`, and frame-denial headers.
7. Submit a loopback URL such as `http://127.0.0.1/` and confirm the API returns safe HTTP 422 `PRIVATE_NETWORK_BLOCKED`.
8. Check desktop and mobile layouts and browser console errors.

## Operational note

The included rate limiter is per application instance and trusts only Vercel's client-IP header. Before sustained traffic, configure Vercel Firewall/rate limiting or replace it with a shared limiter. The Build Week demo should also use account-level OpenAI spend limits and monitoring.

## Self-hosted production check

```bash
npm ci
npm run build
npm run start
```

Set the same server-only environment variables in the hosting platform. Outbound HTTPS access to OpenAI and public evidence sources is required for live mode.
