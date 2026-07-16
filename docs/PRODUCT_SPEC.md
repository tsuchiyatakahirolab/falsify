# Product Specification

## Core user journey

### 1. Submit
User provides:
- pasted text;
- a public URL; or
- a supported document.

### 2. Decompose
GPT-5.6 returns atomic claims with:
- original text span;
- normalized claim;
- claim type;
- empirical testability;
- evidence requirements;
- falsification questions;
- time sensitivity.

### 3. Investigate
Falsify runs deliberately separated evidence tasks:
- **Support path:** evidence that supports the claim.
- **Challenge path:** evidence that contradicts, narrows, or materially qualifies the claim.

The system should prefer primary/authoritative sources when appropriate and preserve source provenance.

### 4. Audit
For each claim, the engine checks what is feasible in the MVP:
- source/citation fit;
- temporal fit;
- numeric fit;
- causal or inferential overreach;
- attribution of intent;
- historical analogy;
- selective context.

### 5. Present
A Claim Card shows:
- claim;
- claim type;
- what would make it wrong;
- supported factual core;
- supporting evidence;
- contradictory/qualifying evidence;
- unresolved evidence;
- issue labels;
- verdict;
- explanation;
- source links.

### 6. Challenge
The user can trigger **Challenge this finding**. A new adversarial pass attempts to break Falsify's conclusion.

Outcomes:
- finding holds;
- finding is qualified;
- finding changes;
- remains unresolved.

## Verdict ontology

Primary verdicts:
- SUPPORTED
- PARTIALLY_SUPPORTED
- CONTRADICTED
- INSUFFICIENT_EVIDENCE
- SOURCE_MISMATCH
- NOT_VERIFIABLE
- CONTESTED_INTERPRETATION
- LEGITIMATE_CRITICISM

Issue labels may include:
- FALSE_FACTUAL_CLAIM
- MISLEADING
- UNSUPPORTED
- SELECTIVE_CONTEXT
- OUTDATED
- NUMERICAL_MISMATCH
- CAUSAL_OVERREACH
- ATTRIBUTION_NOT_ESTABLISHED
- HISTORICAL_ANALOGY_NOT_ESTABLISHED
- CATEGORY_SHIFT
- INFERENCE_EXCEEDS_EVIDENCE

Do not collapse these into a document-level score.

## Claim types

- factual;
- quantitative;
- temporal;
- comparative;
- causal;
- attribution/intent;
- prediction;
- historical analogy;
- interpretation;
- normative.

Normative claims should not be falsely presented as empirically falsifiable.

## Flagship narrative audit

For strategic narratives, the UI should separate:

1. factual core;
2. framing;
3. omission/selective context;
4. category shift;
5. historical analogy;
6. causal leap;
7. attribution of intent;
8. normative conclusion;
9. consistency test;
10. counter-evidence.

Example logic:

A defense-spending increase may be factually supported.  
The inference that this alone establishes a return to pre-1945 militarism is a separate proposition requiring independent evidence.

The same standard must be applied to a Japanese rebuttal.

## Language

English-first for the Build Week interface. Japanese output is high-value if implementation cost is low. Source text may be multilingual if the model can process it reliably.

## Accessibility

- readable contrast;
- keyboard navigable primary flow;
- no verdict meaning conveyed by color alone;
- evidence and source links readable on desktop and mobile.
