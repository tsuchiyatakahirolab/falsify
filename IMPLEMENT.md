# IMPLEMENT.md — Execution Runbook

Follow `PLANS.md` milestone by milestone.

## Operating method

1. Inspect repository state and current milestone.
2. Make a short implementation plan for that milestone only.
3. Use subagents for bounded research/review/test tasks when useful, but keep the primary Codex thread responsible for core integration.
4. Implement the smallest coherent slice.
5. Run validation immediately.
6. Fix failures before adding scope.
7. Update `DOCUMENTATION.md`.
8. Commit a reversible checkpoint if appropriate.
9. Move to the next milestone only when the exit test passes.

## Required validation

Once commands exist, run the repository equivalents of:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Also perform a browser smoke test of the end-to-end path.

## Decision policy

Escalate only decisions that change:
- the product thesis;
- public/private data boundaries;
- licensing;
- political neutrality/symmetric evaluation;
- major architecture;
- Build Week eligibility;
- use of proprietary Tsuchiya Lab assets.

All other reversible implementation decisions may be made autonomously and documented.

## Completion reporting

Each work session should end with:
- current HEAD/branch if Git is initialized;
- files changed;
- tests run and results;
- milestone status;
- unresolved blockers;
- next exact action.

Do not report PASS if the working path was not executed.
