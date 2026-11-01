export const PRODUCT = {
  name: "Falsify",
  provider: "TSUCHIYA LAB",
  repository: "https://github.com/tsuchiyatakahirolab/falsify",
  company: "https://tsuchiyalab.com",
  overview: "https://tsuchiyalab.com/products/falsify",
  title: {
    en: "Inspect the evidence behind each claim",
    ja: "主張と根拠の対応を確認する",
  },
} as const;

export const TEACHING_EXAMPLE = {
  ja: "新技術の導入により消費電力が20%減少した。したがって、どの施設でも導入すれば同じ削減効果が得られる。",
  en: "Introducing a new technology reduced electricity consumption by 20%. Therefore, every facility would achieve the same reduction by adopting it.",
} as const;

export type Locale = "ja" | "en";

const japaneseLabels: Record<string, string> = {
  SUPPORTED: "根拠による支持あり",
  PARTIALLY_SUPPORTED: "一部に支持あり",
  CONTRADICTED: "反証あり",
  INSUFFICIENT_EVIDENCE: "根拠が不足",
  SOURCE_MISMATCH: "出典との不一致",
  NOT_VERIFIABLE: "経験的検証の対象外",
  CONTESTED_INTERPRETATION: "解釈に争いあり",
  LEGITIMATE_CRITICISM: "根拠のある批判",
  factual: "事実に関する主張",
  quantitative: "数値に関する主張",
  temporal: "時点に依存する主張",
  comparative: "比較に関する主張",
  causal: "因果関係に関する主張",
  attribution_intent: "意図の帰属",
  prediction: "予測",
  historical_analogy: "歴史的類推",
  interpretation: "解釈",
  normative: "規範的判断",
  empirically_testable: "経験的に検証可能",
  partially_testable: "一部を検証可能",
  not_empirically_falsifiable: "経験的な反証が困難",
  supporting: "支持する資料",
  contradicting: "反証する資料",
  qualifying: "限定・条件を示す資料",
  contextual: "背景資料",
  primary_official: "政府等の一次資料",
  primary_data: "一次データ",
  primary_research: "原著研究",
  secondary_scholarly: "学術的な二次資料",
  secondary_journalistic: "報道資料",
  other: "その他",
  direct: "直接関連",
  indirect: "間接的に関連",
  context_only: "背景情報のみ",
  directly_supports: "直接支持する",
  partially_supports: "一部を支持する",
  does_not_directly_support: "直接の支持にはならない",
  unclear: "対応が不明",
  FALSE_FACTUAL_CLAIM: "事実との不一致",
  MISLEADING: "誤解を生む記述",
  UNSUPPORTED: "根拠が不足",
  SELECTIVE_CONTEXT: "比較・文脈の偏り",
  OUTDATED: "時点の不一致",
  NUMERICAL_MISMATCH: "数値の不一致",
  CAUSAL_OVERREACH: "因果推論の要確認箇所",
  ATTRIBUTION_NOT_ESTABLISHED: "意図の帰属が未立証",
  HISTORICAL_ANALOGY_NOT_ESTABLISHED: "歴史的類推が未立証",
  CATEGORY_SHIFT: "対象区分の変化",
  INFERENCE_EXCEEDS_EVIDENCE: "根拠を超える推論",
  holds: "判断を維持",
  qualified: "判断の範囲を限定",
  changed: "判断を変更",
  unresolved: "未解決",
};
const englishVerdicts: Record<string, string> = {
  SUPPORTED: "Supported",
  PARTIALLY_SUPPORTED: "Partially supported",
  CONTRADICTED: "Contradicted",
  INSUFFICIENT_EVIDENCE: "Insufficient evidence",
  SOURCE_MISMATCH: "Source mismatch",
  NOT_VERIFIABLE: "Not empirically verifiable",
  CONTESTED_INTERPRETATION: "Contested interpretation",
  LEGITIMATE_CRITICISM: "Legitimate criticism",
};

export function labelFor(value: string, locale: Locale): string {
  return locale === "ja"
    ? (japaneseLabels[value] ?? value.replaceAll("_", " "))
    : (englishVerdicts[value] ?? value.replaceAll("_", " "));
}
