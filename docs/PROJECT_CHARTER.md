# Project Charter

## Product

**Falsify**  
Open-source adversarial evidence verification for research, public claims, and strategic narratives.

## Problem

AI-assisted research and public analysis increasingly make it easy to produce plausible, citation-rich text. Existing tools often optimize for retrieval, summary, support, or review. A user still needs a practical way to ask:

- What exactly is being claimed?
- What evidence would be required?
- What would falsify or materially qualify the claim?
- Does the cited source support the specific proposition?
- Is relevant contradictory evidence missing?
- Is the author moving from fact to inference without sufficient support?

## Product thesis

The useful unit of verification is not "the document" or "the author." It is the **claim-evidence-inference chain**.

Falsify should make that chain inspectable and adversarially test it.

## Primary users

- researchers;
- policy analysts;
- journalists and fact-checkers;
- students and educators;
- public-sector analysts;
- professionals evaluating evidence-dependent reports.

## Non-goals

Falsify is not:
- a replacement for expert peer review;
- an automated journal acceptance/rejection system;
- a generic writing assistant;
- a plagiarism detector;
- a political persuasion bot;
- a national credibility ranking system;
- an intent detector for "disinformation";
- a database product that subsumes XINAPI, NARRAPI, QUNAPI, or other Tsuchiya Lab products.

## Public positioning

The public project should be framed as a general verification infrastructure. The China-to-Japan narrative layer is a flagship use case demonstrating how the same method can inspect strategic narratives and false/misleading information.

## Success in one sentence

A user should leave Falsify knowing **which part of a claim survives scrutiny, which part does not, why, and exactly where to inspect the evidence**.
