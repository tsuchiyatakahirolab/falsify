# Evaluation Plan

## Goal

Test whether Falsify improves claim-level evidence inspection without becoming an overconfident automated reviewer.

## MVP evaluation dimensions

### 1. Claim decomposition
- Does the system split compound claims into independently testable propositions?
- Does it preserve the original meaning?
- Does it distinguish empirical from normative claims?

### 2. Falsification quality
- Are falsification questions genuinely capable of weakening the claim?
- Do they avoid merely restating the claim?

### 3. Evidence provenance
- Does every evidence item retain a source reference?
- Are primary sources preferred where appropriate?
- Are unsupported claims marked rather than filled with invented evidence?

### 4. Adversarial balance
- Does the support path find real support?
- Does the contradiction path actively seek disconfirming or qualifying evidence?
- Does the final synthesis represent both fairly?

### 5. Citation/source fit
When testable:
- existence;
- relevance;
- directness;
- temporal fit;
- quantitative fit.

### 6. Inference audit
Can the system distinguish:
- evidence supports X;
- author concludes Y;
- X does not independently establish Y?

### 7. Self-correction
Does "Challenge this finding" sometimes qualify or change an earlier finding when counter-evidence warrants it?

## Golden eval set

Use `evals/golden_cases.jsonl`.

The initial set is synthetic and tests mechanics without depending on live web state. Add a small set of public real-world examples after implementation, with source URLs and evaluation notes.

## Do not optimize for

- a single "accuracy" number without a labeled benchmark;
- a single document truth score;
- agreement with the project owner's political priors.

## Human review

For each flagship demo finding, manually inspect:
- claim extraction;
- source correctness;
- quoted passage fit;
- verdict;
- omitted counter-evidence;
- wording strength.

## Build Week success threshold

The demo is ready when:
- at least 80% of synthetic golden cases produce the intended issue class or a defensible stricter/qualified equivalent;
- no evaluated case invents a source;
- the flagship demo has manually inspected provenance;
- the self-challenge flow visibly demonstrates epistemic revision or justified stability.
