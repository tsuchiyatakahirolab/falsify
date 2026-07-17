import {
  AnalysisResultSchema,
  ChallengeResultSchema,
  type AnalysisResult,
  type ChallengeResult,
} from "@/lib/domain/schemas";

const generatedAt = "2026-07-17T00:00:00.000Z";

const claim1Original =
  "Japan's official FY2026 draft defense budget proposal reached a record high and includes planned long-range strike capabilities.";
const claim2Original =
  "The draft budget proposal and planned capability expansion establish a revival of pre-1945 Japanese militarism.";
const claim3Original =
  "Japan invokes a China threat with the intention of deceiving international society.";
const claim4Original =
  "Japan's defense minister replied that China's criticism was intentionally false information.";
const flagshipInputContent = [
  claim1Original,
  claim2Original,
  claim3Original,
  claim4Original,
].join(" ");

function sourceSpanFor(text: string): { start: number; end: number } {
  const start = flagshipInputContent.indexOf(text);
  return { start, end: start + text.length };
}

export const FLAGSHIP_DEMO_ID = "demo-japan-defense-narrative-v1";

export const flagshipAnalysis: AnalysisResult = AnalysisResultSchema.parse({
  id: FLAGSHIP_DEMO_ID,
  generated_at: generatedAt,
  input: {
    type: "text",
    content: flagshipInputContent,
    title:
      "Reciprocal official narratives on Japan's FY2026 draft defense budget proposal",
    source_url: null,
    file_name: null,
    mime_type: null,
  },
  claims: [
    {
      id: "claim-1",
      original_text: claim1Original,
      normalized_claim:
        "Japan's official FY2026 draft defense budget proposal is record-scale and includes planned investment in long-range strike capabilities.",
      claim_type: "quantitative",
      testability: "empirically_testable",
      evidence_requirements: [
        "Japan's official FY2026 draft budget proposal and planned capability allocations",
      ],
      falsification_questions: [
        "Do Japan's draft budget documents show a lower proposed total or no planned funding for the stated long-range capabilities?",
      ],
      time_sensitive: true,
      entities: [
        "Japan",
        "Ministry of Defense",
        "FY2026 draft defense budget proposal",
      ],
      source_span: sourceSpanFor(claim1Original),
    },
    {
      id: "claim-2",
      original_text: claim2Original,
      normalized_claim:
        "The draft budget proposal and planned capability expansion establish a revival of pre-1945 Japanese militarism.",
      claim_type: "historical_analogy",
      testability: "partially_testable",
      evidence_requirements: [
        "Explicit criteria for the historical analogy",
        "Evidence connecting current institutions, doctrine, and political control to those defining features",
        "Evidence addressing narrower security and constitutional explanations",
      ],
      falsification_questions: [
        "Are defining features of the historical system absent under current civilian, constitutional, and alliance controls?",
        "Can documented security-policy explanations account for the capability expansion without establishing the broader analogy?",
      ],
      time_sensitive: false,
      entities: ["Japan", "pre-1945 militarism"],
      source_span: sourceSpanFor(claim2Original),
    },
    {
      id: "claim-3",
      original_text: claim3Original,
      normalized_claim:
        "Japan invokes a China threat with the intention of deceiving international society.",
      claim_type: "attribution_intent",
      testability: "empirically_testable",
      evidence_requirements: [
        "Direct statements, planning records, or credible circumstantial evidence of deceptive intent",
      ],
      falsification_questions: [
        "Is the attribution based on evidence of intent, or inferred from disagreement with Japan's public justification?",
      ],
      time_sensitive: false,
      entities: ["Japan", "China", "international society"],
      source_span: sourceSpanFor(claim3Original),
    },
    {
      id: "claim-4",
      original_text: claim4Original,
      normalized_claim:
        "China's criticism was intentionally false information.",
      claim_type: "attribution_intent",
      testability: "empirically_testable",
      evidence_requirements: [
        "Evidence that the criticism was knowingly false rather than disputed interpretation or adversarial framing",
      ],
      falsification_questions: [
        "Does the criticism contain supported factual concerns even if its strongest analogy is unestablished?",
        "What evidence shows knowledge of falsity or a deliberate information operation?",
      ],
      time_sensitive: false,
      entities: ["Japan Ministry of Defense", "China"],
      source_span: sourceSpanFor(claim4Original),
    },
  ],
  evidence: [
    {
      id: "evidence-1",
      claim_id: "claim-1",
      stance: "supporting",
      title: "Overview of FY2026 Budget",
      url: "https://www.mod.go.jp/j/budget/yosan_gaiyo/fy2026/point.pdf",
      publisher: "Japan Ministry of Defense",
      published_at: "2025-12-26",
      source_type: "primary_official",
      excerpt:
        "The ministry's overview documents a record-scale draft budget proposal and planned stand-off defense capabilities.",
      relevance: "direct",
      directness: "directly_supports",
      notes: "Primary budget source; manually reviewed for this curated demo.",
    },
    {
      id: "evidence-2",
      claim_id: "claim-2",
      stance: "supporting",
      title: "Overview of FY2026 Budget",
      url: "https://www.mod.go.jp/j/budget/yosan_gaiyo/fy2026/point.pdf",
      publisher: "Japan Ministry of Defense",
      published_at: "2025-12-26",
      source_type: "primary_official",
      excerpt:
        "The draft budget proposal supports planned capability expansion, including stand-off defense systems.",
      relevance: "direct",
      directness: "partially_supports",
      notes:
        "Supports the factual premise, not the separate historical analogy.",
    },
    {
      id: "evidence-3",
      claim_id: "claim-2",
      stance: "qualifying",
      title: "National Security Strategy of Japan",
      url: "https://www.cas.go.jp/jp/siryou/221216anzenhoshou/national_security_strategy_2022_pamphlet-e.pdf",
      publisher: "Cabinet Secretariat of Japan",
      published_at: "2022-12-16",
      source_type: "primary_official",
      excerpt:
        "Japan's published strategy presents the buildup as deterrence under civilian and constitutional institutions.",
      relevance: "direct",
      directness: "does_not_directly_support",
      notes:
        "Primary source for Japan's stated rationale; not automatically authoritative about every contested regional fact.",
    },
    {
      id: "evidence-4",
      claim_id: "claim-2",
      stance: "qualifying",
      title:
        "Global military spending rise continues as European and Asian expenditures surge",
      url: "https://www.sipri.org/media/press-release/2026/global-military-spending-rise-continues-european-and-asian-expenditures-surge",
      publisher: "Stockholm International Peace Research Institute",
      published_at: "2026-04-27",
      source_type: "primary_data",
      excerpt:
        "Comparative expenditure data places Japan's increase within a broader regional and global rise in military spending.",
      relevance: "indirect",
      directness: "does_not_directly_support",
      notes:
        "Comparative context neither proves nor disproves the historical analogy by itself.",
    },
    {
      id: "evidence-5",
      claim_id: "claim-3",
      stance: "contextual",
      title: "Foreign Ministry Spokesperson's Regular Press Conference",
      url: "https://www.fmprc.gov.cn/mfa_eng/xw/fyrbt/202512/t20251226_11788128.html",
      publisher:
        "Ministry of Foreign Affairs of the People's Republic of China",
      published_at: "2025-12-26",
      source_type: "primary_official",
      excerpt:
        "The spokesperson links Japan's budget and threat framing to remilitarization and misleading international opinion.",
      relevance: "direct",
      directness: "partially_supports",
      notes:
        "Direct evidence that the attribution was made, not independent proof of Japan's deceptive intent.",
    },
    {
      id: "evidence-6",
      claim_id: "claim-4",
      stance: "contextual",
      title: "Press Conference by the Defense Minister",
      url: "https://www.mod.go.jp/j/press/kisha/2025/1226a.html",
      publisher: "Japan Ministry of Defense",
      published_at: "2025-12-26",
      source_type: "primary_official",
      excerpt:
        "The minister rejects the Chinese characterization and attributes it to an intentional information campaign.",
      relevance: "direct",
      directness: "partially_supports",
      notes:
        "Direct evidence that Japan made the reciprocal attribution, not independent proof of China's intent.",
    },
  ],
  findings: [
    {
      claim_id: "claim-1",
      verdict: "SUPPORTED",
      issue_labels: [],
      factual_core:
        "Japan's Ministry of Defense published a record-scale FY2026 draft defense budget proposal with material planned stand-off capability investment.",
      analysis:
        "The official draft budget materials directly support the proposed amount and capability plan. They do not show final Diet enactment or subsequent execution, and they do not decide what broader political meaning should be assigned to the buildup.",
      unresolved: [
        "Final Diet enactment and subsequent execution can differ from the published draft proposal.",
        "Cross-country comparisons depend on exchange rates, accounting scope, and denominator.",
      ],
      supporting_evidence_ids: ["evidence-1"],
      challenging_evidence_ids: [],
      human_judgment_required: false,
    },
    {
      claim_id: "claim-2",
      verdict: "PARTIALLY_SUPPORTED",
      issue_labels: [
        "HISTORICAL_ANALOGY_NOT_ESTABLISHED",
        "INFERENCE_EXCEEDS_EVIDENCE",
      ],
      factual_core:
        "The draft budget proposal and capability plan are real and can support legitimate concern about Japan's changing defense posture.",
      analysis:
        "Those proposal facts do not independently establish a revival of pre-1945 militarism. That analogy requires explicit institutional and political criteria beyond planned expenditure growth. Japan's own strategy offers a narrower deterrence rationale, while comparative data shows that regional context matters.",
      unresolved: [
        "The proper threshold for militarization is contested.",
        "Constitutional and doctrinal implications require expert interpretation.",
      ],
      supporting_evidence_ids: ["evidence-2"],
      challenging_evidence_ids: ["evidence-3", "evidence-4"],
      human_judgment_required: true,
    },
    {
      claim_id: "claim-3",
      verdict: "INSUFFICIENT_EVIDENCE",
      issue_labels: ["ATTRIBUTION_NOT_ESTABLISHED"],
      factual_core:
        "The PRC spokesperson made the attribution; the supplied record does not independently establish Japan's deceptive intent.",
      analysis:
        "Disagreement with Japan's threat assessment is not by itself evidence that Japanese officials knowingly sought to deceive international audiences.",
      unresolved: [
        "No direct or independently corroborated circumstantial evidence of deceptive intent is in the curated source set.",
      ],
      supporting_evidence_ids: ["evidence-5"],
      challenging_evidence_ids: [],
      human_judgment_required: true,
    },
    {
      claim_id: "claim-4",
      verdict: "INSUFFICIENT_EVIDENCE",
      issue_labels: ["ATTRIBUTION_NOT_ESTABLISHED"],
      factual_core:
        "Japan's defense minister made a reciprocal intent attribution; that statement does not independently prove China's intent.",
      analysis:
        "The same standard applies to the rebuttal: adversarial or overstated criticism is not automatically a deliberate false-information operation.",
      unresolved: [
        "No evidence in the curated source set independently establishes knowledge of falsity or deceptive intent.",
      ],
      supporting_evidence_ids: ["evidence-6"],
      challenging_evidence_ids: [],
      human_judgment_required: true,
    },
  ],
  audits: [
    {
      claim_id: "claim-1",
      issue_labels: [],
      checks: [
        {
          type: "number",
          status: "pass",
          explanation:
            "The official budget source directly supports the record-scale allocation premise.",
          observed: "FY2026 official budget overview",
          expected: "Primary budget record",
        },
      ],
    },
    {
      claim_id: "claim-2",
      issue_labels: [
        "HISTORICAL_ANALOGY_NOT_ESTABLISHED",
        "INFERENCE_EXCEEDS_EVIDENCE",
      ],
      checks: [
        {
          type: "analogy",
          status: "flag",
          explanation:
            "The expenditure and capability facts do not alone establish the analogy's defining political and institutional features.",
          observed: "Budget growth and stand-off capability",
          expected:
            "Independent criteria connecting current and historical systems",
        },
      ],
    },
    {
      claim_id: "claim-3",
      issue_labels: ["ATTRIBUTION_NOT_ESTABLISHED"],
      checks: [
        {
          type: "attribution",
          status: "flag",
          explanation:
            "The source establishes that the allegation was made, not the alleged deceptive intention.",
          observed: "Official spokesperson attribution",
          expected: "Direct or corroborated circumstantial evidence of intent",
        },
      ],
    },
    {
      claim_id: "claim-4",
      issue_labels: ["ATTRIBUTION_NOT_ESTABLISHED"],
      checks: [
        {
          type: "attribution",
          status: "flag",
          explanation:
            "The Japanese rebuttal also infers intent without independently establishing it.",
          observed: "Official ministerial rebuttal",
          expected: "Direct or corroborated circumstantial evidence of intent",
        },
      ],
    },
  ],
  limitations: [
    "Curated sample based on public sources manually reviewed on 2026-07-17; it is not a substitute for a fresh live search.",
    "English paraphrases summarize multilingual official material; inspect the linked originals.",
    "The sample applies the same intent standard to the original claim and the rebuttal.",
  ],
  model: "curated-public-source-demo-v1",
  mode: "sample",
});

const dietEvidence = {
  id: "recheck-evidence-1",
  claim_id: "claim-2",
  stance: "qualifying" as const,
  title: "Research Report on Foreign Affairs and National Security",
  url: "https://www.sangiin.go.jp/eng/report/2023gaikouanzenhosho.pdf",
  publisher: "House of Councillors, National Diet of Japan",
  published_at: "2023-06",
  source_type: "primary_official" as const,
  excerpt:
    "The parliamentary research record preserves plural domestic views, including concern about defense transformation and constitutional restraint.",
  relevance: "direct" as const,
  directness: "partially_supports" as const,
  notes:
    "New evidence found by the curated self-challenge path; it supports legitimate concern without independently proving the strongest historical analogy.",
};

export function challengeFlagshipFinding(
  claimId: string,
): ChallengeResult | null {
  if (claimId !== "claim-2") return null;
  const original = flagshipAnalysis.findings.find(
    (finding) => finding.claim_id === claimId,
  );
  if (!original) return null;

  return ChallengeResultSchema.parse({
    claim_id: claimId,
    challenged_at: generatedAt,
    outcome: "qualified",
    original_finding: original,
    revised_finding: {
      ...original,
      analysis:
        "The draft budget proposal and planned capability expansion still do not independently establish a revival of pre-1945 militarism. However, Japanese parliamentary material documents genuine domestic concern about the scale, constitutional implications, and direction of defense transformation. A rebuttal claiming there is no legitimate basis for concern would therefore be too broad.",
      unresolved: [
        "The historical analogy remains unestablished under explicit institutional criteria.",
        "How much current policy erodes post-war restraint remains a legitimate contested interpretation.",
      ],
      challenging_evidence_ids: [
        ...original.challenging_evidence_ids,
        dietEvidence.id,
      ],
      human_judgment_required: true,
    },
    new_evidence: [dietEvidence],
    explanation:
      "The initial rejection of the strongest historical analogy holds, but the finding is qualified: Japanese parliamentary debate supplies evidence that narrower concern about eroding defense restraint is legitimate.",
  });
}
