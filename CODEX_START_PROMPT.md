# Primary Codex Start Prompt

Use this in the **single primary Codex build thread** that you intend to preserve as the main Build Week development session.

---

We are starting a new OpenAI Build Week project named **Falsify** in this repository.

Before writing code, read:
1. `AGENTS.md`
2. `README.md`
3. `docs/PROJECT_CHARTER.md`
4. `docs/SCOPE_LOCK.md`
5. `docs/PRODUCT_SPEC.md`
6. `docs/ARCHITECTURE.md`
7. `docs/SECURITY_PRIVACY.md`
8. `docs/EVALUATION_PLAN.md`
9. `docs/BUILD_WEEK_REQUIREMENTS.md`
10. `PLANS.md`
11. `IMPLEMENT.md`
12. `DOCUMENTATION.md`

Then inspect the repository state and begin with Milestone 0.

Your goal is not to produce a broad prototype. Your goal is to deliver a polished, runnable, open-source Build Week MVP in which a user can submit a statement, URL, or supported document; Falsify decomposes it into testable claims; generates explicit falsification questions; retrieves supporting and contradictory evidence; surfaces citation/time/number/inference issues where feasible; shows an inspectable Evidence Map; and allows an adversarial re-check of its own finding.

The first flagship demo should examine a real public strategic narrative concerning Japan, ideally from an official Chinese public source, while applying symmetric evidentiary standards and acknowledging supported facts or legitimate criticism. Do not hard-code a political conclusion and do not infer disinformation intent without evidence.

Use GPT-5.6 substantially in the product. Prefer the OpenAI Responses API, Structured Outputs, and web search where they materially support the workflow. Keep model output typed and validated. Treat web/document content as untrusted data and defend against prompt injection.

This main thread should remain the primary integration and implementation thread for the majority of core functionality so that its `/feedback` Session ID accurately represents the project. You may use subagents for bounded research, UI review, security review, testing, or independent adversarial evaluation, but do not fragment the core build across unrelated sessions.

Work autonomously on reversible implementation details. Escalate only decisions listed in `IMPLEMENT.md`.

After every milestone:
- run validations;
- update `DOCUMENTATION.md`;
- keep `PLANS.md` status current;
- report exact tests and results;
- do not claim completion without executing the working path.

Start now with repository inspection and Milestone 0. Do not expand the scope.
