import type {
  AnalysisResult,
  AuditObservation,
  ChallengeResult,
  Evidence,
  Finding,
} from "@/lib/domain/schemas";

import { labelFor, PRODUCT, type Locale } from "./content";

type Challenges = Record<string, ChallengeResult>;

interface Coverage {
  scope: "selected_claims";
  analyzed_claims: number;
  extracted_claims: number | null;
  analysis_limit: number | null;
  extraction_limit: number | null;
}

const copy = {
  en: {
    report: "Evidence review report",
    scope: "Selected-claim coverage",
    scopeNote:
      "This report covers selected claims. It does not establish that every claim in the submitted material was extracted or reviewed.",
    summaryNote:
      "Evidence summaries are summaries or paraphrases, not verified verbatim quotations. Inspect the linked originals.",
    reviewNote:
      "Every finding requires review against the original sources, including findings with no additional review flag.",
    challengeNote:
      "The report includes the latest available re-check for each claim, not a complete history of earlier re-checks.",
    analysisId: "Analysis ID",
    generatedAt: "Analysis generated at",
    model: "Model",
    mode: "Mode",
    analyzed: "Claims analyzed",
    extracted: "Claims extracted",
    analysisLimit: "Analysis limit",
    extractionLimit: "Extraction limit",
    notRecorded: "Not recorded",
    none: "None recorded",
    yes: "Yes",
    no: "No",
    input: "Submitted material",
    inputType: "Input type",
    inputTitle: "Input title",
    inputUrl: "Input source URL",
    fileName: "File name",
    inputContent: "Submitted text",
    claim: "Claim",
    originalText: "Original excerpt from the submitted text",
    normalized: "Normalized claim",
    claimType: "Claim type",
    testability: "Testability",
    timeSensitive: "Time-sensitive",
    span: "Source span",
    entities: "Entities",
    requirements: "Evidence requirements",
    questions: "Questions that could disprove or qualify the claim",
    initialFinding: "Initial analysis finding",
    missingFinding: "No finding is recorded for this claim.",
    verdict: "Verdict",
    issues: "Issue labels",
    factualCore: "Supported factual core",
    reasoning: "Explanation",
    unresolved: "Unresolved questions",
    supportIds: "Supporting evidence IDs",
    challengeIds: "Challenging evidence IDs",
    humanReview: "Additional review flag",
    additionalReview: "Additional human judgment flagged",
    noAdditionalReview: "No additional flag; review the original sources",
    checks: "Audit observations",
    checkType: "Check",
    checkStatus: "Status",
    observed: "Observed",
    expected: "Expected",
    latestChallenge: "Latest re-check",
    challengedAt: "Re-checked at",
    outcome: "Outcome",
    beforeChallenge: "Finding before this re-check",
    revisedFinding: "Finding after this re-check",
    analysisSources: "Sources recorded in the initial analysis",
    newSources: "Sources added by this re-check",
    source: "Source",
    title: "Title",
    url: "URL",
    unsafeUrl: "URL omitted because it is not a valid HTTP(S) link.",
    claimId: "Claim ID",
    stance: "Evidence path",
    publisher: "Publisher",
    publicationDate: "Publication date",
    sourceType: "Source type",
    relevance: "Relevance",
    directness: "Source-to-claim fit",
    notes: "Provenance and source notes",
    summary: "Source summary; not a verified quotation",
    limitations: "Recorded limitations",
  },
  ja: {
    report: "主張と根拠の確認レポート",
    scope: "確認した主張の範囲",
    scopeNote:
      "このレポートは選択された主張を対象としています。入力した資料のすべての主張を抽出・確認したことを意味しません。",
    summaryNote:
      "資料の要約は、原文と照合した直接引用ではありません。リンク先の原資料を確認してください。",
    reviewNote:
      "追加の要確認フラグがない場合も含め、すべての判定を原資料と照合する必要があります。",
    challengeNote:
      "主張ごとに利用可能な最新の再検討結果を収録しています。それ以前の再検討の履歴全体ではありません。",
    analysisId: "分析ID",
    generatedAt: "分析の生成日時",
    model: "使用モデル",
    mode: "動作モード",
    analyzed: "分析した主張の件数",
    extracted: "抽出した主張の件数",
    analysisLimit: "分析件数の上限",
    extractionLimit: "抽出件数の上限",
    notRecorded: "記録なし",
    none: "記録なし",
    yes: "はい",
    no: "いいえ",
    input: "入力した資料",
    inputType: "入力形式",
    inputTitle: "入力資料の名称",
    inputUrl: "入力資料のURL",
    fileName: "ファイル名",
    inputContent: "入力本文",
    claim: "主張",
    originalText: "入力本文中の該当箇所",
    normalized: "確認対象の主張",
    claimType: "主張の種類",
    testability: "検証可能性",
    timeSensitive: "時点に依存する主張",
    span: "入力本文中の位置",
    entities: "対象となる名称",
    requirements: "必要な証拠",
    questions: "主張を否定・限定し得る確認事項",
    initialFinding: "最初の分析による判定",
    missingFinding: "この主張の判定は記録されていません。",
    verdict: "判定",
    issues: "確認を要する点",
    factualCore: "根拠が示す事実",
    reasoning: "説明",
    unresolved: "未確認・未解決の点",
    supportIds: "支持資料のID",
    challengeIds: "反証・留保となる資料のID",
    humanReview: "追加の要確認フラグ",
    additionalReview: "人による追加の判断が必要です。",
    noAdditionalReview:
      "追加の要確認フラグはありません。原資料の確認は必要です。",
    checks: "個別の確認結果",
    checkType: "確認項目",
    checkStatus: "状態",
    observed: "観測された内容",
    expected: "確認の基準",
    latestChallenge: "最新の再検討",
    challengedAt: "再検討の日時",
    outcome: "再検討の結果",
    beforeChallenge: "今回の再検討前の判定",
    revisedFinding: "今回の再検討後の判定",
    analysisSources: "最初の分析で記録した資料",
    newSources: "今回の再検討で追加した資料",
    source: "資料",
    title: "資料名",
    url: "URL",
    unsafeUrl: "有効なHTTP(S)リンクではないため、URLを省略しました。",
    claimId: "主張のID",
    stance: "資料の位置づけ",
    publisher: "発行元",
    publicationDate: "公開日",
    sourceType: "資料の種類",
    relevance: "関連性",
    directness: "主張との対応",
    notes: "資料の来歴と注記",
    summary: "資料の要約。原文を確認した直接引用ではありません。",
    limitations: "記録された分析上の限界",
  },
} as const;

/** Escape data before placing it in a Markdown paragraph or block quote. */
function escapeMarkdown(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replace(/([\\`*_{}\[\]()#+\-.!|~=:])/g, "\\$1");
}

function block(value: string): string {
  return escapeMarkdown(value)
    .split(/\r\n|\r|\n/)
    .map((line) => `> ${line}`)
    .join("\n");
}

function httpUrl(value: string): string | null {
  if (/[\u0000-\u0020\u007f]/.test(value)) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    return url.href.replace(/[<>"\\]/g, (character) =>
      encodeURIComponent(character),
    );
  } catch {
    return null;
  }
}

function coverageFor(result: AnalysisResult): Coverage {
  // Older saved/demo results predate optional coverage metadata.
  const coverage = result.coverage;
  return (
    coverage ?? {
      scope: "selected_claims",
      analyzed_claims: result.claims.length,
      extracted_claims: null,
      analysis_limit: null,
      extraction_limit: null,
    }
  );
}

function latestChallenges(
  result: AnalysisResult,
  challenges: Challenges,
): ChallengeResult[] {
  return result.claims.flatMap((claim) => {
    const challenge = Object.hasOwn(challenges, claim.id)
      ? challenges[claim.id]
      : undefined;
    if (
      !challenge ||
      challenge.claim_id !== claim.id ||
      challenge.original_finding.claim_id !== claim.id ||
      challenge.revised_finding.claim_id !== claim.id
    ) {
      return [];
    }
    return [challenge];
  });
}

/** Produce a portable Markdown report without interpreting source text as markup. */
export function createMarkdownReport(
  result: AnalysisResult,
  challenges: Challenges = {},
  locale: Locale = "en",
): string {
  const words = copy[locale];
  const lines: string[] = [];
  const coverage = coverageFor(result);
  const latest = latestChallenges(result, challenges);
  const field = (name: string, value: string | number | null | undefined) => {
    lines.push(
      `- ${name}: ${escapeMarkdown(String(value ?? words.notRecorded))}`,
    );
  };
  const labelled = (value: string) => `${labelFor(value, locale)} (${value})`;
  const heading = (name: string, depth = 2) => {
    lines.push("", `${"#".repeat(depth)} ${name}`, "");
  };
  const text = (
    name: string,
    value: string,
    depth = 4,
    originalExcerpt = false,
  ) => {
    heading(name, depth);
    lines.push(
      originalExcerpt
        ? block(value || words.none)
        : escapeMarkdown(value || words.none),
    );
  };
  const items = (name: string, values: string[], depth = 4) => {
    heading(name, depth);
    lines.push(
      ...(values.length
        ? values.map(
            (value) => `- ${escapeMarkdown(value).replaceAll("\n", "\n  ")}`,
          )
        : [words.none]),
    );
  };
  const link = (name: string, value: string | null) => {
    const safe = value ? httpUrl(value) : null;
    lines.push(
      `- ${name}: ${
        safe && value
          ? `[${escapeMarkdown(value)}](<${safe}>)`
          : value
            ? words.unsafeUrl
            : words.notRecorded
      }`,
    );
  };
  const finding = (name: string, value: Finding, depth = 3) => {
    heading(name, depth);
    field(words.verdict, labelled(value.verdict));
    field(
      words.issues,
      value.issue_labels.map(labelled).join("; ") || words.none,
    );
    field(
      words.humanReview,
      value.human_judgment_required
        ? words.additionalReview
        : words.noAdditionalReview,
    );
    field(
      words.supportIds,
      value.supporting_evidence_ids.join(", ") || words.none,
    );
    field(
      words.challengeIds,
      value.challenging_evidence_ids.join(", ") || words.none,
    );
    text(words.factualCore, value.factual_core, depth + 1);
    text(words.reasoning, value.analysis, depth + 1);
    items(words.unresolved, value.unresolved, depth + 1);
  };
  const sources = (name: string, evidence: Evidence[], depth = 2) => {
    heading(name, depth);
    if (!evidence.length) lines.push(words.none);
    for (const [index, source] of evidence.entries()) {
      heading(
        `${words.source} ${index + 1}: ${escapeMarkdown(source.id)}`,
        depth + 1,
      );
      field(words.title, source.title);
      link(words.url, source.url);
      field(words.claimId, source.claim_id);
      field(words.stance, labelled(source.stance));
      field(words.publisher, source.publisher);
      field(words.publicationDate, source.published_at);
      field(words.sourceType, labelled(source.source_type));
      field(words.relevance, labelled(source.relevance));
      field(words.directness, labelled(source.directness));
      text(words.summary, source.excerpt ?? words.notRecorded, depth + 2);
      text(words.notes, source.notes ?? words.notRecorded, depth + 2);
    }
  };
  const audits = (observations: AuditObservation[]) => {
    heading(words.checks, 3);
    if (!observations.length) lines.push(words.none);
    for (const observation of observations) {
      field(
        words.issues,
        observation.issue_labels.map(labelled).join("; ") || words.none,
      );
      for (const check of observation.checks) {
        lines.push("");
        field(words.checkType, check.type);
        field(words.checkStatus, check.status);
        field(words.reasoning, check.explanation);
        field(words.observed, check.observed);
        field(words.expected, check.expected);
      }
    }
  };

  lines.push(`# ${PRODUCT.name} by ${PRODUCT.provider}`, "", words.report, "");
  field(words.analysisId, result.id);
  field(words.generatedAt, result.generated_at);
  field(words.model, result.model);
  field(words.mode, result.mode);
  heading(words.scope);
  lines.push(words.scopeNote, "");
  field(words.analyzed, coverage.analyzed_claims);
  field(words.extracted, coverage.extracted_claims);
  field(words.analysisLimit, coverage.analysis_limit);
  field(words.extractionLimit, coverage.extraction_limit);
  lines.push(
    "",
    words.summaryNote,
    "",
    words.reviewNote,
    "",
    words.challengeNote,
  );
  heading(words.input);
  field(words.inputType, result.input.type);
  field(words.inputTitle, result.input.title);
  link(words.inputUrl, result.input.source_url);
  field(words.fileName, result.input.file_name);
  text(words.inputContent, result.input.content, 3, true);

  for (const [index, claim] of result.claims.entries()) {
    heading(`${words.claim} ${index + 1}: ${escapeMarkdown(claim.id)}`);
    field(words.normalized, claim.normalized_claim);
    field(words.claimType, labelled(claim.claim_type));
    field(words.testability, labelled(claim.testability));
    field(words.timeSensitive, claim.time_sensitive ? words.yes : words.no);
    field(words.entities, claim.entities.join(", ") || words.none);
    field(
      words.span,
      claim.source_span
        ? `start: ${claim.source_span.start}; end: ${claim.source_span.end}`
        : null,
    );
    text(words.originalText, claim.original_text, 3, true);
    items(words.requirements, claim.evidence_requirements, 3);
    items(words.questions, claim.falsification_questions, 3);
    const initial = result.findings.find((item) => item.claim_id === claim.id);
    if (initial) finding(words.initialFinding, initial);
    else lines.push("", words.missingFinding);
    audits(result.audits.filter((item) => item.claim_id === claim.id));

    const challenge = latest.find((item) => item.claim_id === claim.id);
    if (challenge) {
      heading(words.latestChallenge, 3);
      field(words.challengedAt, challenge.challenged_at);
      field(words.outcome, labelled(challenge.outcome));
      text(words.reasoning, challenge.explanation);
      finding(words.beforeChallenge, challenge.original_finding, 4);
      finding(words.revisedFinding, challenge.revised_finding, 4);
      sources(words.newSources, challenge.new_evidence, 4);
    }
  }

  sources(words.analysisSources, result.evidence);
  items(words.limitations, result.limitations, 2);
  return `${lines.join("\n").trim()}\n`;
}

/** Preserve the analysis and latest re-checks separately in a versioned JSON file. */
export function createJsonReport(
  result: AnalysisResult,
  challenges: Challenges = {},
): string {
  const latest = latestChallenges(result, challenges);
  const allEvidence = [
    ...result.evidence,
    ...latest.flatMap((challenge) => challenge.new_evidence),
  ];
  if (
    allEvidence.some((source) => httpUrl(source.url) === null) ||
    (result.input.source_url && httpUrl(result.input.source_url) === null)
  ) {
    throw new Error(
      "Report contains a source URL that is not a valid HTTP(S) link.",
    );
  }

  // Provider-rendered attribution HTML is UI metadata, not evidence or report text.
  const { search_suggestions_html: providerHtml, ...analysis } = result;
  void providerHtml;
  const latestRechecks = latest.map((challenge) => {
    const { search_suggestions_html: attributionHtml, ...recheck } = challenge;
    void attributionHtml;
    return recheck;
  });

  return `${JSON.stringify(
    {
      format: "falsify-report",
      schema_version: "1.0",
      product: `${PRODUCT.name} by ${PRODUCT.provider}`,
      repository: PRODUCT.repository,
      analysis_generated_at: result.generated_at,
      coverage: coverageFor(result),
      report_notes: [
        copy.en.scopeNote,
        copy.en.summaryNote,
        copy.en.reviewNote,
        copy.en.challengeNote,
      ],
      omitted_fields: ["search_suggestions_html"],
      analysis,
      latest_challenges: latestRechecks,
    },
    null,
    2,
  )}\n`;
}
