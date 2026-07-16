# Relationship to Tsuchiya Lab Products and SPReAD

Falsify must be designed in the context of the full Tsuchiya Lab portfolio without absorbing or exposing independent products.

## Shared foundation

### Kagami Core
A shared conceptual/technical foundation for semantic structuring and evidence binding across parts of the portfolio.

Falsify may reuse general architectural principles that the owner has the right to reuse, but the Build Week repository must remain independently runnable and must not silently import proprietary code or data.

## Capability / Intelligence products

### XINAPI
Independent flagship China-analysis SaaS/API and evidence/source intelligence product.

Relationship:
- XINAPI: **What evidence exists and how is it structured?**
- Falsify: **Does a claim survive adversarial testing against evidence?**

Falsify must not be reduced to an XINAPI front end, and XINAPI must not be absorbed into Falsify.

### NARRAPI
Independent narrative structure/transformation analysis product.

Relationship:
- NARRAPI: **What narrative is being constructed and how is it changing?**
- Falsify: **Which factual and inferential components of that narrative survive evidence testing?**

### QUNAPI
Independent affect/resonance analysis product.

Relationship:
- QUNAPI: **Why does a narrative resonate and with whom?**
- Falsify: **Is the claim evidentially supported?**

## Application / workflow products

### TL Veilfin
Scenario and risk exploration.

Relationship:
- Falsify establishes what can be supported now.
- Veilfin explores what could happen next under explicit assumptions.

### TL Archer
Evidence-bound drafting.

Relationship:
- Falsify breaks weak arguments.
- Archer can later rebuild an argument using only evidence that survived scrutiny.

### TL Discus
Review, deliberation, peer-review simulation, rebuttal, and polishing.

Relationship:
- Falsify audits the evidence chain.
- Discus explores competing interpretations, objections, and deliberative judgment.

### TL Pilotfish
Internal Growth Operator with an external demo/estimate-facing placeholder, not a general public SaaS.

Relationship:
- Pilotfish may support release communication, GitHub outreach, demos, and distribution.
- It is not part of the Falsify verification engine.

## Specialized data and research assets

### CMCF / CDPAT / GQSO
Protected or specialized data assets. They may someday provide optional expert evidence integrations, but the open-source MVP must not depend on them.

### CONPD / JNOM
The closest research complement.

- CONPD/JNOM: **What is China saying, who says it, when, and how does the narrative evolve?**
- Falsify: **Does the individual claim or narrative chain survive evidence testing?**

Potential private research flow:

```text
CONPD/JNOM observation
        ↓
Falsify verification
        ↓
JNOM policy/narrative opportunity analysis
```

The public Build Week repo must not expose protected corpus content.

### PMAA / CLFEA
Academic research databases. Falsify may be used to stress-test inferences in research based on them, but they are not product data dependencies.

## SPReAD

SPReAD is a research program, not a SaaS product.

Conceptual relationship:
- SPReAD studies AI-assisted verification, reproducibility, ML/QML comparison, and human-in-the-loop research workflows.
- Falsify is an open-source experimental implementation of adversarial evidence verification.

A useful formulation:

> CONPD observes claims. Falsify tests claims. SPReAD tests whether AI-assisted verification itself works.

Important boundary:
- Do not state that Falsify is an official SPReAD deliverable unless formally approved.
- Do not import grant-funded code/data or research-participant data without explicit rights and governance review.
- Any future use of Falsify interaction data for research requires separate consent, privacy, and ethics design.

## Portfolio role

Falsify can become Tsuchiya Lab's **open-source public-trust flagship**, while XINAPI remains an independent professional/commercial flagship.

Falsify's openness should increase trust in the method without making protected data assets public.
