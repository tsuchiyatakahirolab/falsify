# Sample Use Cases

## 1. Research paper citation fit

Input:
A paper states that Policy X caused a 20% decline in unemployment and cites Study A.

Falsify asks:
- Does Study A estimate causation or correlation?
- Is 20% relative or absolute?
- Is the population the same?
- Does the time window match?

Possible finding:
The source supports an association but does not independently establish the causal magnitude claimed.

## 2. Outdated current-status claim

Input:
"Country A is currently the world's largest producer of X," citing a 2019 source.

Falsify asks:
- Is the claim time-sensitive?
- Is there a current authoritative dataset?
- Has the ranking changed?

Possible issue:
OUTDATED / REVERIFICATION_REQUIRED.

## 3. Strategic narrative about Japan

Input:
A public statement argues that increased Japanese defense spending proves a revival of pre-1945 militarism.

Falsify separates:
- defense spending increase;
- capability expansion;
- definition of militarization;
- historical analogy;
- threat inference;
- normative policy conclusion.

Possible finding:
The factual core may be supported while the historical analogy and threat inference require independent evidence.

Then:
**Challenge this finding** searches for evidence that could strengthen the original analogy or weaken the rebuttal.

## 4. Japanese counterclaim

Input:
A rebuttal claims there is "no basis whatsoever" for concern.

Falsify applies the same standard:
- Are there factual developments that justify some concern?
- Is the rebuttal overbroad?
- Which criticism is legitimate even if the strongest narrative is unsupported?

Possible finding:
LEGITIMATE_CRITICISM on limited points, while broader historical claims remain unestablished.

## 5. Corporate public claim

Input:
"Our technology reduces energy use by 40%."

Falsify asks:
- compared with what baseline?
- under which workload?
- independently measured?
- average or best case?
- current production version or prototype?

Possible finding:
PARTIALLY_SUPPORTED with missing baseline/context.
