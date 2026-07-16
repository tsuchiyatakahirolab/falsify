---
name: build-week-delivery
description: Keep Falsify's OpenAI Build Week implementation focused, validated, and submission-ready.
---

# Build Week Delivery Skill

Use this skill for implementation work in the Falsify repository.

## Workflow

1. Read `PLANS.md`, `IMPLEMENT.md`, and `DOCUMENTATION.md`.
2. Identify the current milestone and its exit test.
3. Work only on the current milestone unless a blocker requires a minimal prerequisite.
4. Delegate bounded noisy tasks to subagents when useful:
   - security review;
   - UI critique;
   - independent test design;
   - adversarial prompt review;
   - documentation audit.
5. Keep core implementation and integration in the primary thread.
6. Run validations before marking a milestone complete.
7. Update `DOCUMENTATION.md` and milestone status.
8. Preserve a judge-testable path at all times.

## Anti-patterns

Do not:
- add auth, billing, enterprise features, or dashboards before the core flow works;
- hide uncertainty behind a numeric truth score;
- replace real evidence provenance with model-generated citations;
- use proprietary Tsuchiya Lab assets in the public repo;
- let the China-to-Japan demo become a hard-coded political rebuttal;
- claim "disinformation" without evidence of deceptive intent;
- spread the majority of core implementation across unrelated Codex sessions.
