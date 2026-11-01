import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import {
  CLAIM_TYPES,
  ClaimSchema,
  TESTABILITY_VALUES,
  type Claim,
} from "@/lib/domain/schemas";
import { getLiveProvider } from "@/lib/ai/provider";
import { GEMINI_MODEL } from "@/lib/gemini/client";
import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai/client";

import { DECOMPOSITION_PROMPT, UNTRUSTED_CONTENT_POLICY } from "./prompts";

const ModelClaimSchema = z
  .object({
    id: z.string(),
    original_text: z.string(),
    normalized_claim: z.string(),
    claim_type: z.enum(CLAIM_TYPES),
    testability: z.enum(TESTABILITY_VALUES),
    evidence_requirements: z.array(z.string()),
    falsification_questions: z.array(z.string()).min(1),
    time_sensitive: z.boolean(),
    entities: z.array(z.string()),
    source_span: z
      .object({ start: z.number().int(), end: z.number().int() })
      .nullable(),
  })
  .strict();

const DecompositionOutputSchema = z
  .object({
    claims: z.array(ModelClaimSchema).min(1).max(8),
  })
  .strict();

export interface DecompositionResult {
  claims: Claim[];
  model: string;
  mode: "live" | "sample";
  limitations: string[];
}

function hasJapaneseText(text: string): boolean {
  // Kana distinguishes Japanese prose from Chinese source material.
  return /[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(text);
}

function japaneseClaimTypeFor(text: string): Claim["claim_type"] | null {
  if (
    /べき|ねばならない|なければならない|してはならない|望ましい|許されない/.test(
      text,
    )
  ) {
    return "normative";
  }

  // These cues identify a sentence's topic, not whether it is true. In
  // particular, do not turn an explicit denial or uncertainty statement into
  // a positive attribution or analogy that downstream audits would flag.
  const qualified =
    /とは(?:言え|いえ)ない|とは限らない|わけではない|ではない|ではなかった|断定できない|確認(?:されてい|でき)ない|不明|未確認/.test(
      text,
    );
  if (
    !qualified &&
    /(?:戦前|戦時|過去|歴史上).{0,20}(?:と同じ|と同様|に似て|の再来|への回帰|に逆戻り)|歴史的(?:な)?類推に当たる/.test(
      text,
    )
  ) {
    return "historical_analogy";
  }
  if (
    !qualified &&
    !/(?:意図|目的|狙い).{0,20}(?:していない|しなかった|持っていない|持たない|がない|はない)/.test(
      text,
    ) &&
    /意図的に|故意に|(?:意図|計画)(?:した|している|していた|する)|(?:意図|目的|狙い)(?:は|がある|を持)|を狙って/.test(
      text,
    )
  ) {
    return "attribution_intent";
  }
  if (
    !qualified &&
    /を引き起こ|をもたら(?:した|す)|につなが(?:った|る)|に起因(?:した|する)|(?:原因|要因)(?:である|だった|となった)|(?:増加|減少|上昇|低下|改善|悪化)させ/.test(
      text,
    )
  ) {
    return "causal";
  }
  if (/見込まれ|見込み|予測され|予測する|予想され|だろう|でしょう/.test(text)) {
    return "prediction";
  }
  if (/現在|現時点|今日|最新|今年|昨年|来年|時点/.test(text)) {
    return "temporal";
  }
  if (
    /と比べ|に比べ|と比較|より(?:も)?(?:多い|少ない|高い|低い|大きい|小さい)|最大|最小|最多|最少/.test(
      text,
    )
  ) {
    return "comparative";
  }
  if (
    /[0-9０-９]+(?:[.,．][0-9０-９]+)*\s*(?:[%％]|パーセント|倍|兆|億|万|円|人|件|社|年|月|日|台|キロ|トン)/.test(
      text,
    )
  ) {
    return "quantitative";
  }
  if (/を示唆|を意味|と解釈|と考えられ|とみられ/.test(text)) {
    return "interpretation";
  }
  return null;
}

function claimTypeFor(text: string): Claim["claim_type"] {
  if (hasJapaneseText(text)) {
    const japaneseType = japaneseClaimTypeFor(text);
    if (japaneseType) return japaneseType;
  }
  const value = text.toLowerCase();
  if (/\b(should|ought|must be|unacceptable|justified)\b/.test(value)) {
    return "normative";
  }
  if (
    /\b(pre-?war|historical|return to|revival|again becoming)\b/.test(value)
  ) {
    return "historical_analogy";
  }
  if (/\b(intent|intends|secret|deliberately|deceiv|aims? to)\b/.test(value)) {
    return "attribution_intent";
  }
  if (
    /\b(caused?|causes?|proves?|leads? to|resulted? in|because)\b/.test(value)
  ) {
    return "causal";
  }
  if (/\b(currently|latest|today|now|as of)\b/.test(value)) {
    return "temporal";
  }
  if (
    /\b\d+(?:\.\d+)?\s*(?:%|percent|fold|billion|million|trillion)?\b/.test(
      value,
    )
  ) {
    return "quantitative";
  }
  if (
    /\b(more|less|higher|lower|largest|smallest|compared|than)\b/.test(value)
  ) {
    return "comparative";
  }
  if (/\b(will|forecast|expected to|likely to)\b/.test(value)) {
    return "prediction";
  }
  if (/\b(suggests|means|indicates|represents)\b/.test(value)) {
    return "interpretation";
  }
  return "factual";
}

function testabilityFor(type: Claim["claim_type"]): Claim["testability"] {
  if (type === "normative") return "not_empirically_falsifiable";
  if (
    type === "historical_analogy" ||
    type === "interpretation" ||
    type === "prediction"
  ) {
    return "partially_testable";
  }
  return "empirically_testable";
}

function questionFor(type: Claim["claim_type"], text: string): string {
  const subject = text.length > 120 ? `${text.slice(0, 117)}…` : text;
  if (hasJapaneseText(text)) {
    const questions: Record<Claim["claim_type"], string> = {
      factual: `「${subject}」が記述どおりではないことを示す、信頼できる一次資料はあるか。`,
      quantitative:
        "元資料の数値、単位、比較の基準、計算を確認すると、異なる結果になるか。",
      temporal:
        "より新しい信頼できる資料によって、対象の時点や状況が変わったと確認できるか。",
      comparative:
        "同じ期間、対象、分母を用いて比較すると、差が縮まるか、結果が逆転するか。",
      causal:
        "資料が示すのは相関関係か因果関係か。また、同じ結果を説明できる別の原因はあるか。",
      attribution_intent:
        "意図の説明を支える直接証拠や信頼できる状況証拠はあるか。結果からの推測だけに依存していないか。",
      prediction:
        "どの時点に、どのような観察結果が得られれば、この予測を修正する必要があるか。",
      historical_analogy:
        "類推の根拠となる歴史的な特徴は共通しているか。重要な相違点や別の説明はあるか。",
      interpretation:
        "同じ証拠を説明でき、根拠のない前提がより少ない別の解釈はあるか。",
      normative:
        "検証できる事実上の前提はどれか。また、経験的な検証だけでは判断できない価値判断はどれか。",
    };
    return questions[type];
  }
  const questions: Record<Claim["claim_type"], string> = {
    factual: `What reliable primary evidence would show that “${subject}” did not occur as stated?`,
    quantitative:
      "Do comparable source figures, units, baselines, and calculations produce a materially different number?",
    temporal:
      "Does newer authoritative evidence show that the time-sensitive status has changed?",
    comparative:
      "Does a like-for-like comparison using the same period and denominator reverse or narrow the claim?",
    causal:
      "Could the evidence establish association rather than causation, or support a plausible alternative cause?",
    attribution_intent:
      "Is there direct or credible circumstantial evidence of intent, rather than an inference from outcomes alone?",
    prediction:
      "Which observable outcome and time horizon would count against this prediction?",
    historical_analogy:
      "Are the analogy’s defining historical features absent, materially different, or explained by a narrower account?",
    interpretation:
      "What credible alternative interpretation fits the same evidence with fewer unsupported assumptions?",
    normative:
      "Which factual premises can be tested separately, and which value judgment remains outside empirical verification?",
  };
  return questions[type];
}

function sentenceSpans(
  text: string,
): Array<{ text: string; start: number; end: number }> {
  const mask = (value: string) => value.replace(/[.!?。！？]/g, "·");
  // All replacements preserve UTF-16 length. Segment offsets therefore still
  // address the original text, including URLs, whitespace and surrogate pairs.
  const boundaryText = text
    .replace(/\b(?:https?:\/\/|www\.)[^\s<>"「」『』。！？]+/giu, (url) => {
      const trailing = url.match(/[.!?,;:)\]}]+$/)?.[0] ?? "";
      return mask(url.slice(0, url.length - trailing.length)) + trailing;
    })
    .replace(
      /\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|Fig|Eq|No|Vol|Dept|approx|e\.g|i\.e)\.(?=[\t ]+\S)/gi,
      mask,
    )
    .replace(/(?<![A-Za-z.])\b[A-Z]\.(?=[\t ]+[A-Z][a-z])/g, mask)
    .replace(
      /\b(?:[A-Za-z]\.){2,}/g,
      (abbreviation: string, offset: number, source: string) => {
        const after = source.slice(offset + abbreviation.length);
        const endsSentence =
          !after.trim() ||
          /^[\t ]*(?:\r?\n|(?:The|This|That|He|She|It|They|We|Next|However)\b)/.test(
            after,
          );
        return endsSentence
          ? mask(abbreviation.slice(0, -1)) + "."
          : mask(abbreviation);
      },
    )
    .replace(
      /「[^「」]*」|『[^『』]*』/g,
      (quotation: string, offset: number, source: string) => {
        const after = source.slice(offset + quotation.length);
        const continues = /^(?:と|って|など|を|が|は|に|で|、)/.test(after);
        return quotation.replace(
          /[.!?。！？]+/g,
          (punctuation, index: number) =>
            !continues && index + punctuation.length === quotation.length - 1
              ? punctuation
              : mask(punctuation),
        );
      },
    );

  const spans: Array<{ text: string; start: number; end: number }> = [];
  const segmenter = new Intl.Segmenter("ja", { granularity: "sentence" });
  for (const segment of segmenter.segment(boundaryText)) {
    const original = text.slice(
      segment.index,
      segment.index + segment.segment.length,
    );
    for (const line of original.matchAll(/[^\r\n]+/g)) {
      const value = line[0].trim();
      if (!/[\p{L}\p{N}]/u.test(value)) continue;
      const leading = line[0].length - line[0].trimStart().length;
      const start = segment.index + (line.index ?? 0) + leading;
      spans.push({ text: value, start, end: start + value.length });
      if (spans.length === 8) return spans;
    }
  }
  return spans;
}

function localDecompositionLimitation(text: string): string {
  return hasJapaneseText(text)
    ? "文の区切りと表現上の手掛かりから主張の候補を抽出しています。複合文の論点、否定、引用、文脈に依存する意味は、人による確認が必要です。"
    : "Local decomposition uses sentence boundaries and wording cues, not a full semantic analysis. Compound, negated, quoted, or context-dependent statements need human review.";
}

export function decomposeClaimsLocally(text: string): DecompositionResult {
  const spans = sentenceSpans(text);
  const candidates = spans.length
    ? spans
    : [
        {
          text: text.trim(),
          start: text.length - text.trimStart().length,
          end: text.trimEnd().length,
        },
      ];

  const claims = candidates.map((item, index) => {
    const claim_type = claimTypeFor(item.text);
    return ClaimSchema.parse({
      id: `claim-${index + 1}`,
      original_text: item.text,
      normalized_claim:
        item.text.replace(/[.!?。！？]+(?=["'”’」』]*$)/u, "").trim() ||
        item.text,
      claim_type,
      testability: testabilityFor(claim_type),
      evidence_requirements: [
        hasJapaneseText(item.text)
          ? claim_type === "normative"
            ? "価値判断の前提と、それとは別に検証できる事実上の前提"
            : "主張の内容を直接確認できる、関連する一次資料または信頼できる資料"
          : claim_type === "normative"
            ? "Explicit value premise and separately testable factual premises"
            : "Relevant primary or authoritative evidence that directly addresses the proposition",
      ],
      falsification_questions: [questionFor(claim_type, item.text)],
      time_sensitive:
        claim_type === "temporal" ||
        /\b(202\d|current|latest|today)\b/i.test(item.text) ||
        /現在|現時点|今日|最新|今年|昨年|来年/.test(item.text),
      entities: [],
      source_span: { start: item.start, end: item.end },
    });
  });

  return {
    claims,
    model: "deterministic-fallback",
    mode: "sample",
    limitations: [
      "No supported server-side model key is configured, so claim decomposition used a deterministic fallback and no live evidence search was performed.",
      localDecompositionLimitation(text),
    ],
  };
}

function normalizeModelClaims(
  text: string,
  parsed: z.infer<typeof DecompositionOutputSchema>,
): Claim[] {
  return parsed.claims.map((raw, index) => {
    const fallbackStart = text.indexOf(raw.original_text);
    const span = raw.source_span;
    const validSpan =
      span &&
      span.start >= 0 &&
      span.end >= span.start &&
      span.end <= text.length &&
      text.slice(span.start, span.end) === raw.original_text
        ? span
        : fallbackStart >= 0
          ? {
              start: fallbackStart,
              end: fallbackStart + raw.original_text.length,
            }
          : null;

    return ClaimSchema.parse({
      ...raw,
      id: `claim-${index + 1}`,
      evidence_requirements: raw.evidence_requirements.filter(Boolean),
      entities: raw.entities.filter(Boolean),
      source_span: validSpan,
    });
  });
}

export async function decomposeClaims(
  text: string,
): Promise<DecompositionResult> {
  const provider = getLiveProvider();
  if (!provider) return decomposeClaimsLocally(text);

  if (provider === "gemini") {
    const decomposition = decomposeClaimsLocally(text);
    return {
      ...decomposition,
      model: GEMINI_MODEL,
      mode: "live",
      limitations: [
        "To conserve the public Gemini free-tier quota, claim decomposition and final auditing are deterministic; Gemini is reserved for two independent grounded evidence searches.",
        localDecompositionLimitation(text),
      ],
    };
  }

  const client = getOpenAIClient();
  const response = await client.responses.parse({
    model: OPENAI_MODEL,
    max_output_tokens: 6_000,
    reasoning: { effort: "medium" },
    input: [
      {
        role: "system",
        content: `${UNTRUSTED_CONTENT_POLICY}\n${DECOMPOSITION_PROMPT}`,
      },
      {
        role: "user",
        content: `<untrusted_submission>\n${text}\n</untrusted_submission>`,
      },
    ],
    text: {
      format: zodTextFormat(DecompositionOutputSchema, "claim_decomposition"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("GPT-5.6 returned no structured claim decomposition.");
  }

  return {
    claims: normalizeModelClaims(text, response.output_parsed),
    model: OPENAI_MODEL,
    mode: "live",
    limitations: [],
  };
}
