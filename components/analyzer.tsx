"use client";

import { useRef, useState } from "react";

import { useLanguage } from "./language";
import { labelFor, TEACHING_EXAMPLE } from "@/lib/product/content";
import { createJsonReport, createMarkdownReport } from "@/lib/product/report";

import {
  AnalysisResultSchema,
  ChallengeResultSchema,
  type AnalysisResult,
  type ChallengeResult,
  type Claim,
  type Evidence,
  type Finding,
} from "@/lib/domain/schemas";

type InputMode = "text" | "url" | "document";

function EvidenceItem({ evidence }: { evidence: Evidence }) {
  const { locale, t } = useLanguage();
  return (
    <article className="source-card">
      <div className="source-card-meta">
        <span>{labelFor(evidence.source_type, locale)}</span>
        <span>{labelFor(evidence.relevance, locale)}</span>
        <span>{labelFor(evidence.directness, locale)}</span>
      </div>
      <a href={evidence.url} target="_blank" rel="noreferrer">
        {evidence.title}
        <span aria-hidden="true">↗</span>
      </a>
      <p className="source-summary">
        <strong>
          {t(
            "Source summary (not a verified quotation)",
            "資料の要約（原文の引用ではありません）",
          )}
        </strong>
        {evidence.excerpt ??
          t(
            "No source summary was returned.",
            "資料の要約は取得できませんでした。",
          )}
      </p>
      {evidence.notes ? (
        <p className="source-note">
          <strong>{t("Provenance note", "資料に関する注記")}</strong>
          {evidence.notes}
        </p>
      ) : null}
      <footer>
        <span>{evidence.publisher ?? new URL(evidence.url).hostname}</span>
        {evidence.published_at ? <span>{evidence.published_at}</span> : null}
      </footer>
    </article>
  );
}

function GoogleSearchSuggestions({ items }: { items: string[] }) {
  const { t } = useLanguage();
  if (!items.length) return null;

  return (
    <aside className="google-search-suggestions">
      <strong>{t("Google Search suggestions", "Google検索の候補")}</strong>
      <p>
        {t(
          "Search attribution returned with the evidence paths.",
          "資料の探索時に返された検索の帰属情報です。",
        )}
      </p>
      {items.map((html, index) => (
        <div
          key={`${index}-${html.length}`}
          className="google-search-suggestion"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ))}
    </aside>
  );
}

function FindingSnapshot({
  label,
  finding,
}: {
  label: string;
  finding: Finding;
}) {
  const { locale, t } = useLanguage();
  return (
    <article className="finding-snapshot">
      <span>{label}</span>
      <strong>{labelFor(finding.verdict, locale)}</strong>
      {finding.factual_core ? <h5>{finding.factual_core}</h5> : null}
      <p>{finding.analysis}</p>
      {finding.issue_labels.length ? (
        <div
          className="issue-list compact"
          aria-label={`${label} audit issues`}
        >
          {finding.issue_labels.map((issue) => (
            <span key={issue}>{labelFor(issue, locale)}</span>
          ))}
        </div>
      ) : null}
      {finding.unresolved.length ? (
        <div className="snapshot-unresolved">
          <span>{t("Unresolved", "未解決の点")}</span>
          <ul>
            {finding.unresolved.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

function EvidenceColumn({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "support" | "challenge";
  items: Evidence[];
}) {
  const { t } = useLanguage();
  return (
    <section className={`result-evidence-column ${tone}`}>
      <div className="result-column-heading">
        <span aria-hidden="true" />
        <h4>{title}</h4>
        <small>{items.length}</small>
      </div>
      {items.length ? (
        items.map((item) => <EvidenceItem key={item.id} evidence={item} />)
      ) : (
        <p className="empty-evidence">
          {t(
            "No usable source record is available for this evidence path. The evidence remains incomplete.",
            "ここに表示できる資料はありません。必要な根拠が揃っていない状態です。",
          )}
        </p>
      )}
    </section>
  );
}

function ClaimCard({
  claim,
  result,
  challenge,
  challengeLoading,
  onChallenge,
}: {
  claim: Claim;
  result: AnalysisResult;
  challenge: ChallengeResult | undefined;
  challengeLoading: boolean;
  onChallenge: (claimId: string) => Promise<void>;
}) {
  const { locale, t } = useLanguage();
  const finding = result.findings.find((item) => item.claim_id === claim.id);
  const audit = result.audits.find((item) => item.claim_id === claim.id);
  const evidence = result.evidence.filter((item) => item.claim_id === claim.id);
  const support = evidence.filter(
    (item) =>
      item.stance === "supporting" ||
      (item.stance === "contextual" &&
        !item.id.startsWith("challenge-evidence-")),
  );
  const challengingEvidence = evidence.filter(
    (item) =>
      item.stance === "contradicting" ||
      item.stance === "qualifying" ||
      (item.stance === "contextual" &&
        item.id.startsWith("challenge-evidence-")),
  );
  const span =
    claim.source_span &&
    result.input.content.slice(
      claim.source_span.start,
      claim.source_span.end,
    ) === claim.original_text
      ? claim.source_span
      : null;
  if (!finding) return null;

  return (
    <article className="result-claim-card" id={`result-${claim.id}`}>
      <header>
        <div>
          <span>{claim.id.replace("claim-", t("Claim ", "主張 "))}</span>
          <span>{labelFor(claim.claim_type, locale)}</span>
          <span>{labelFor(claim.testability, locale)}</span>
        </div>
        <strong className={`verdict verdict-${finding.verdict.toLowerCase()}`}>
          {labelFor(finding.verdict, locale)}
        </strong>
      </header>

      <p className="result-claim-text">{claim.normalized_claim}</p>
      {claim.original_text ? (
        <blockquote>
          {t("Original", "入力の該当箇所")}: {claim.original_text}
        </blockquote>
      ) : null}

      {span ? (
        <details className="source-position">
          <summary>
            {t("Show the passage in context", "入力文の前後を確認する")}
          </summary>
          <p>
            {span.start > 60 ? "…" : ""}
            {result.input.content.slice(
              Math.max(0, span.start - 60),
              span.start,
            )}
            <mark>{result.input.content.slice(span.start, span.end)}</mark>
            {result.input.content.slice(span.end, span.end + 60)}
            {span.end + 60 < result.input.content.length ? "…" : ""}
          </p>
        </details>
      ) : null}

      <section className="falsification-box">
        <span className="prompt-icon" aria-hidden="true">
          ?
        </span>
        <div>
          <h4>
            {t(
              "What would make this claim wrong or require qualification?",
              "どのような根拠があれば、この主張を修正すべきか",
            )}
          </h4>
          <ul>
            {claim.falsification_questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </div>
      </section>

      <div className="result-evidence-grid">
        <EvidenceColumn
          title={t("Supporting evidence", "支持する資料")}
          tone="support"
          items={support}
        />
        <EvidenceColumn
          title={t("Contradictory or qualifying", "反証・限定を示す資料")}
          tone="challenge"
          items={challengingEvidence}
        />
      </div>

      <section className="finding-panel">
        <p className="panel-kicker">
          {t("Inspectable finding", "根拠を確認できる判断")}
        </p>
        <h4>{finding.factual_core}</h4>
        <p>{finding.analysis}</p>
        {audit?.issue_labels.length ? (
          <div className="issue-list" aria-label="Audit issues">
            {audit.issue_labels.map((issue) => (
              <span key={issue}>{labelFor(issue, locale)}</span>
            ))}
          </div>
        ) : null}
        {finding.unresolved.length ? (
          <div className="unresolved-list">
            <strong>{t("Still unresolved", "確認が残る点")}</strong>
            <ul>
              {finding.unresolved.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <button
          className="challenge-button"
          type="button"
          disabled={challengeLoading}
          onClick={() => void onChallenge(claim.id)}
        >
          {challengeLoading
            ? t("Searching for counter-evidence…", "反証となる資料を探索中…")
            : t("Challenge this finding", "この判断を再検証する")}
          <span>
            {challenge
              ? t("Run again", "再実行")
              : t("Adversarial re-check →", "反対の根拠を探す →")}
          </span>
        </button>
        {challenge ? (
          <section className="challenge-result" aria-live="polite">
            <div>
              <p>{t("Re-check outcome", "再検証の結果")}</p>
              <strong>{labelFor(challenge.outcome, locale)}</strong>
            </div>
            <p>{challenge.explanation}</p>
            <div className="finding-comparison">
              <FindingSnapshot
                label={t("Original finding", "再検証前の判断")}
                finding={challenge.original_finding}
              />
              <span aria-hidden="true">→</span>
              <FindingSnapshot
                label={t("Revised finding", "再検証後の判断")}
                finding={challenge.revised_finding}
              />
            </div>
            {challenge.new_evidence.length ? (
              <div className="recheck-sources">
                <strong>
                  {t("New counter-evidence", "新たに取得した資料")}
                </strong>
                {challenge.new_evidence.map((item) => (
                  <EvidenceItem key={item.id} evidence={item} />
                ))}
              </div>
            ) : null}
            <GoogleSearchSuggestions
              items={challenge.search_suggestions_html}
            />
          </section>
        ) : null}
      </section>
    </article>
  );
}

export function Analyzer() {
  const { locale, t } = useLanguage();
  const fileSelection = useRef(0);
  const [mode, setMode] = useState<InputMode>("text");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [challenges, setChallenges] = useState<Record<string, ChallengeResult>>(
    {},
  );
  const [challengingId, setChallengingId] = useState<string | null>(null);

  const canSubmit =
    !loading &&
    !challengingId &&
    (mode === "url"
      ? url.trim().length > 0
      : content.trim().length > 0 &&
        content.length <= 30_000 &&
        (mode !== "document" || file !== null));

  async function chooseFile(selected: File | null) {
    const selection = ++fileSelection.current;
    setError(null);
    setFile(null);
    setContent("");
    if (!selected) return;
    if (selected.size > 200_000) {
      setError(
        t(
          "Text files are limited to 200 KB.",
          "テキストファイルは200 KBまでです。",
        ),
      );
      return;
    }
    try {
      const text = await selected.text();
      if (selection !== fileSelection.current) return;
      if (text.length > 30_000) {
        setError(
          t(
            "This file exceeds 30,000 characters. Choose a shorter passage; the file has not been truncated.",
            "30,000文字を超えています。対象とする短い文章を選んでください。内容は切り詰めず、読み込みを中止しました。",
          ),
        );
        return;
      }
      setContent(text);
      setFile(selected);
    } catch {
      if (selection === fileSelection.current)
        setError(
          t(
            "This file could not be read as text.",
            "このファイルをテキストとして読み込めませんでした。",
          ),
        );
    }
  }

  function fillTeachingExample() {
    ++fileSelection.current;
    setContent(TEACHING_EXAMPLE[locale]);
    setFile(null);
    setMode("text");
    setError(null);
    setResult(null);
    setChallenges({});
  }

  function downloadReport(format: "md" | "json") {
    if (!result) return;
    setError(null);
    try {
      const report =
        format === "md"
          ? createMarkdownReport(result, challenges, locale)
          : createJsonReport(result, challenges);
      const href = URL.createObjectURL(
        new Blob([report], {
          type:
            format === "md"
              ? "text/markdown;charset=utf-8"
              : "application/json;charset=utf-8",
        }),
      );
      const link = document.createElement("a");
      link.href = href;
      link.download = `falsify-${result.generated_at.slice(0, 10)}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(href), 1_000);
    } catch {
      setError(
        t(
          "The report could not be saved. Check the source links and try again.",
          "レポートを保存できませんでした。資料のリンクを確認してから再度お試しください。",
        ),
      );
    }
  }

  async function loadFlagshipDemo() {
    ++fileSelection.current;
    setFile(null);
    setResult(null);
    setLoading(true);
    setError(null);
    setChallenges({});
    try {
      const response = await fetch("/api/demo");
      const parsed = AnalysisResultSchema.parse(await response.json());
      setResult(parsed);
      setContent(parsed.input.content);
      setMode("text");
      requestAnimationFrame(() => {
        document
          .querySelector("#evidence-map")
          ?.scrollIntoView({ behavior: "smooth" });
      });
    } catch {
      setError(
        t(
          "The curated public-source demo could not be loaded.",
          "保存済みの出典付きデモを読み込めませんでした。",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setChallenges({});

    const payload =
      mode === "url"
        ? {
            type: "url",
            content: url,
            title: null,
            source_url: url,
            file_name: null,
            mime_type: null,
          }
        : {
            type: mode,
            content,
            title:
              mode === "document" ? (file?.name.slice(0, 200) ?? null) : null,
            source_url: null,
            file_name:
              mode === "document" ? (file?.name ?? "document.txt") : null,
            mime_type: mode === "document" ? file?.type || "text/plain" : null,
          };

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const apiError = body as { message?: string };
        throw new Error(
          apiError.message ??
            t("The analysis request failed.", "分析を完了できませんでした。"),
        );
      }
      const parsed = AnalysisResultSchema.parse(body);
      setResult(parsed);
      requestAnimationFrame(() => {
        document
          .querySelector("#evidence-map")
          ?.scrollIntoView({ behavior: "smooth" });
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : t("Analysis failed.", "分析を完了できませんでした。"),
      );
    } finally {
      setLoading(false);
    }
  }

  async function challenge(claimId: string) {
    if (!result || challengingId) return;
    setChallengingId(claimId);
    setError(null);
    try {
      const response = await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis: result, claim_id: claimId }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const apiError = body as { message?: string };
        throw new Error(
          apiError.message ??
            t(
              "The adversarial re-check failed.",
              "再検証を完了できませんでした。",
            ),
        );
      }
      const parsed = ChallengeResultSchema.parse(body);
      setChallenges((current) => ({ ...current, [claimId]: parsed }));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : t(
              "The adversarial re-check failed.",
              "再検証を完了できませんでした。",
            ),
      );
    } finally {
      setChallengingId(null);
    }
  }

  return (
    <section
      className="analyzer-section"
      id="analyze"
      aria-labelledby="analyze-title"
    >
      <div className="analyzer-heading">
        <div>
          <p className="eyebrow">
            {t("Start with a claim", "短い文章から始める")}
          </p>
          <h2 id="analyze-title">
            {t("Which claims need a closer look?", "確認したい文章を入力する")}
          </h2>
        </div>
        <div className="analyzer-intro-actions">
          <button
            type="button"
            disabled={loading || !!challengingId}
            onClick={fillTeachingExample}
          >
            {t("Use the illustrative passage", "説明用の文章を入力する")}
            <span aria-hidden="true">→</span>
          </button>
          <p>
            {t(
              "Use public or non-sensitive material. Falsify has no permanent manuscript database. Live processing uses external AI and search providers.",
              "公開済み、または機密性のない文章を使ってください。Falsifyは原稿を恒久保存するデータベースを持ちません。ライブ処理には外部のAI・検索サービスを使います。",
            )}
          </p>
          <button
            type="button"
            disabled={loading || !!challengingId}
            onClick={() => void loadFlagshipDemo()}
          >
            {t(
              "Load saved public-source demo (2026-07-17)",
              "出典付きの保存済みデモを見る（2026-07-17）",
            )}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <form className="input-workbench" onSubmit={submit}>
        <div
          className="input-tabs"
          role="tablist"
          aria-label={t("Input type", "入力方法")}
        >
          {(["text", "url", "document"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={mode === item}
              onClick={() => {
                ++fileSelection.current;
                setMode(item);
                setError(null);
              }}
            >
              {item === "text"
                ? t("Pasted text", "文章")
                : item === "url"
                  ? t("Public URL", "公開URL")
                  : t("Text file", "テキストファイル")}
            </button>
          ))}
        </div>

        {mode === "url" ? (
          <label className="field-label">
            {t("Public source URL", "公開されている資料のURL")}
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.org/public-statement"
              required
            />
          </label>
        ) : mode === "document" ? (
          <div className="document-input">
            <label>
              <span>
                {file
                  ? file.name
                  : t("Choose a text file", "テキストファイルを選ぶ")}
              </span>
              <small>
                {t(
                  "TXT, Markdown, JSON, CSV · up to 200 KB and 30,000 characters",
                  "TXT・Markdown・JSON・CSV ／ 200 KBかつ30,000文字まで",
                )}
              </small>
              <input
                type="file"
                accept=".txt,.md,.json,.csv,text/plain,text/markdown,application/json,text/csv"
                onChange={(event) =>
                  void chooseFile(event.target.files?.[0] ?? null)
                }
              />
            </label>
            {content ? (
              <p>
                {content.length.toLocaleString()}{" "}
                {t("characters ready", "文字を読み込みました")}
              </p>
            ) : null}
          </div>
        ) : (
          <label className="field-label">
            {t("Statement, passage, or argument", "確認したい主張や文章")}
            <textarea
              value={content}
              onChange={(event) => {
                ++fileSelection.current;
                setFile(null);
                setContent(event.target.value);
              }}
              placeholder={t(
                "Paste an evidence-dependent claim or short passage…",
                "根拠を確認したい主張や短い文章を貼り付けてください…",
              )}
              rows={8}
              required
            />
            {content.length > 30_000 ? (
              <span role="alert">
                {t(
                  "Choose a passage of no more than 30,000 characters.",
                  "30,000文字以内の文章を選んでください。",
                )}
              </span>
            ) : null}
            <span className="character-count">
              {content.length.toLocaleString()} / 30,000
            </span>
          </label>
        )}

        <div className="input-actions">
          <p>
            {t(
              "Live processing sends submitted content to the configured AI and search providers, subject to their data policies. Availability depends on provider configuration and quota. The saved demo makes no live model call. Review only a short, non-sensitive passage.",
              "ライブ処理では設定されたAI・検索サービスに入力を送信し、各社のデータ利用条件が適用されます。利用可否は接続設定と利用枠によります。保存済みデモはライブのモデル呼び出しを行いません。機密性のない短い文章を対象にしてください。",
            )}
          </p>
          <button
            className="analyze-button"
            type="submit"
            disabled={!canSubmit}
          >
            {loading
              ? t("Checking the evidence…", "確認しています…")
              : t("Inspect the claims", "主張と根拠を確認する")}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>

      {loading ? (
        <div className="analysis-progress" role="status" aria-live="polite">
          <span className="progress-pulse" />
          <div>
            <strong>
              {t(
                "Running separate evidence paths",
                "主張を分け、資料を探索しています",
              )}
            </strong>
            <p>
              {t(
                "Separating claims · seeking support · seeking contradiction · checking inference",
                "主張の分解・支持する資料の探索・反証の探索・推論の点検",
              )}
            </p>
          </div>
        </div>
      ) : null}
      {error ? (
        <div className="analysis-error" role="alert">
          <strong>
            {t(
              "Analysis could not be completed.",
              "処理を完了できませんでした。",
            )}
          </strong>
          <p>{error}</p>
        </div>
      ) : null}

      {result ? (
        <section
          className="evidence-map"
          id="evidence-map"
          aria-labelledby="map-title"
        >
          <header className="map-header">
            <div>
              <p className="eyebrow">{t("Evidence map", "主張と資料の対応")}</p>
              <h2 id="map-title">
                {t(
                  `${result.claims.length} selected claims reviewed`,
                  `${result.claims.length}件の主張を確認`,
                )}
              </h2>
            </div>
            <div className="analysis-meta">
              <span>
                {result.id === "demo-japan-defense-narrative-v1"
                  ? t("Saved public-source demo", "出典付きの保存済みデモ")
                  : result.mode === "live"
                    ? t(
                        `Live analysis · ${result.model}`,
                        `ライブ分析 · ${result.model}`,
                      )
                    : result.model === "deterministic-fallback"
                      ? t(
                          "Local review · no external search",
                          "ローカル点検 · 外部検索なし",
                        )
                      : t(
                          "Limited analysis · see limitations",
                          "制限のある分析 · 注意事項を確認",
                        )}
              </span>
              <span>
                {t(
                  `${result.evidence.length} source records`,
                  `資料レコード ${result.evidence.length}件`,
                )}
              </span>
            </div>
          </header>

          <aside className="coverage-panel">
            <strong>{t("Scope of this review", "今回の確認範囲")}</strong>
            <p>
              {result.coverage
                ? t(
                    `Reviewed ${result.coverage.analyzed_claims} of ${result.coverage.extracted_claims} extracted candidates (analysis limit: ${result.coverage.analysis_limit}; extraction limit: ${result.coverage.extraction_limit}). Extraction does not guarantee that every claim in the input was found.`,
                    `抽出した候補${result.coverage.extracted_claims}件のうち${result.coverage.analyzed_claims}件を確認しました（分析の上限${result.coverage.analysis_limit}件、抽出の上限${result.coverage.extraction_limit}件）。入力に含まれるすべての主張を網羅したとは限りません。`,
                  )
                : t(
                    "This saved example contains selected claims. It does not establish complete coverage or current search results.",
                    "この保存済みデモには選んだ主張を収録しています。入力全体の網羅性や現在の検索結果を示すものではありません。",
                  )}
            </p>
            <p>
              {t("Generated", "作成日時")}: {result.generated_at}
            </p>
          </aside>
          <div className="report-actions">
            <p>
              {t(
                "Download the original findings, sources, limitations and latest re-checks. Files may contain the submitted text.",
                "当初の判断、出典、制約、最新の再検証結果を保存できます。ファイルには入力文も含まれます。",
              )}
            </p>
            <button
              type="button"
              disabled={!!challengingId}
              onClick={() => downloadReport("md")}
            >
              {t("Save Markdown", "Markdownで保存")}
            </button>
            <button
              type="button"
              disabled={!!challengingId}
              onClick={() => downloadReport("json")}
            >
              {t("Save JSON", "JSONで保存")}
            </button>
          </div>

          {result.limitations.length ? (
            <aside className="limitations-panel">
              <strong>{t("Read before interpreting", "結果を読む前に")}</strong>
              <ul>
                {result.limitations.map((limitation) => (
                  <li key={limitation}>{limitation}</li>
                ))}
              </ul>
            </aside>
          ) : null}

          <GoogleSearchSuggestions items={result.search_suggestions_html} />

          <div className="map-layout">
            <nav
              className="claim-index"
              aria-label={t("Selected claims", "対象とした主張")}
            >
              <p>{t("Claim map", "主張の一覧")}</p>
              {result.claims.map((claim, index) => (
                <a key={claim.id} href={`#result-${claim.id}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{claim.normalized_claim}</strong>
                    <small>{labelFor(claim.claim_type, locale)}</small>
                  </div>
                </a>
              ))}
            </nav>
            <div className="claim-results">
              {result.claims.map((claim) => (
                <ClaimCard
                  key={claim.id}
                  claim={claim}
                  result={result}
                  challenge={challenges[claim.id]}
                  challengeLoading={challengingId === claim.id}
                  onChallenge={challenge}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </section>
  );
}
