"use client";

import { useMemo, useState } from "react";

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

const VERDICT_LABELS: Record<Finding["verdict"], string> = {
  SUPPORTED: "Supported",
  PARTIALLY_SUPPORTED: "Partially supported",
  CONTRADICTED: "Contradicted",
  INSUFFICIENT_EVIDENCE: "Insufficient evidence",
  SOURCE_MISMATCH: "Source mismatch",
  NOT_VERIFIABLE: "Not empirically verifiable",
  CONTESTED_INTERPRETATION: "Contested interpretation",
  LEGITIMATE_CRITICISM: "Legitimate criticism",
};

function EvidenceItem({ evidence }: { evidence: Evidence }) {
  return (
    <article className="source-card">
      <div className="source-card-meta">
        <span>{evidence.source_type.replaceAll("_", " ")}</span>
        <span>{evidence.relevance}</span>
      </div>
      <a href={evidence.url} target="_blank" rel="noreferrer">
        {evidence.title}
        <span aria-hidden="true">↗</span>
      </a>
      <p>{evidence.excerpt ?? "No verified excerpt was returned."}</p>
      <footer>
        <span>{evidence.publisher ?? new URL(evidence.url).hostname}</span>
        {evidence.published_at ? <span>{evidence.published_at}</span> : null}
      </footer>
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
          No allowlisted source was returned on this path. This remains an
          evidence gap, not a verdict.
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
  const finding = result.findings.find((item) => item.claim_id === claim.id);
  const audit = result.audits.find((item) => item.claim_id === claim.id);
  const evidence = result.evidence.filter((item) => item.claim_id === claim.id);
  const support = evidence.filter(
    (item) => item.stance === "supporting" || item.stance === "contextual",
  );
  const challengingEvidence = evidence.filter(
    (item) => item.stance === "contradicting" || item.stance === "qualifying",
  );
  if (!finding) return null;

  return (
    <article className="result-claim-card" id={`result-${claim.id}`}>
      <header>
        <div>
          <span>{claim.id.replace("claim-", "Claim ")}</span>
          <span>{claim.claim_type.replaceAll("_", " ")}</span>
          <span>{claim.testability.replaceAll("_", " ")}</span>
        </div>
        <strong className={`verdict verdict-${finding.verdict.toLowerCase()}`}>
          {VERDICT_LABELS[finding.verdict]}
        </strong>
      </header>

      <p className="result-claim-text">{claim.normalized_claim}</p>
      {claim.original_text !== claim.normalized_claim ? (
        <blockquote>Original: “{claim.original_text}”</blockquote>
      ) : null}

      <section className="falsification-box">
        <span className="prompt-icon" aria-hidden="true">
          ?
        </span>
        <div>
          <h4>What would make this claim wrong or require qualification?</h4>
          <ul>
            {claim.falsification_questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </div>
      </section>

      <div className="result-evidence-grid">
        <EvidenceColumn
          title="Supporting evidence"
          tone="support"
          items={support}
        />
        <EvidenceColumn
          title="Contradictory or qualifying"
          tone="challenge"
          items={challengingEvidence}
        />
      </div>

      <section className="finding-panel">
        <p className="panel-kicker">Inspectable finding</p>
        <h4>{finding.factual_core}</h4>
        <p>{finding.analysis}</p>
        {audit?.issue_labels.length ? (
          <div className="issue-list" aria-label="Audit issues">
            {audit.issue_labels.map((issue) => (
              <span key={issue}>{issue.replaceAll("_", " ")}</span>
            ))}
          </div>
        ) : null}
        {finding.unresolved.length ? (
          <div className="unresolved-list">
            <strong>Still unresolved</strong>
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
            ? "Searching for counter-evidence…"
            : "Challenge this finding"}
          <span>{challenge ? "Run again" : "Adversarial re-check →"}</span>
        </button>
        {challenge ? (
          <section className="challenge-result" aria-live="polite">
            <div>
              <p>Re-check outcome</p>
              <strong>{challenge.outcome}</strong>
            </div>
            <p>{challenge.explanation}</p>
            <div className="finding-comparison">
              <div>
                <span>Original</span>
                <strong>
                  {VERDICT_LABELS[challenge.original_finding.verdict]}
                </strong>
              </div>
              <span aria-hidden="true">→</span>
              <div>
                <span>Revised</span>
                <strong>
                  {VERDICT_LABELS[challenge.revised_finding.verdict]}
                </strong>
              </div>
            </div>
            {challenge.new_evidence.length ? (
              <div className="recheck-sources">
                <strong>New counter-evidence</strong>
                {challenge.new_evidence.map((item) => (
                  <EvidenceItem key={item.id} evidence={item} />
                ))}
              </div>
            ) : null}
          </section>
        ) : null}
      </section>
    </article>
  );
}

export function Analyzer() {
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

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (mode === "url") return url.trim().length > 0;
    return content.trim().length >= 8;
  }, [content, loading, mode, url]);

  async function chooseFile(selected: File | null) {
    setError(null);
    setFile(selected);
    if (!selected) {
      setContent("");
      return;
    }
    if (selected.size > 200_000) {
      setError("Documents are limited to 200 KB for this public demo.");
      setFile(null);
      return;
    }
    try {
      setContent((await selected.text()).slice(0, 30_000));
    } catch {
      setError("This document could not be read as text.");
      setFile(null);
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
            title: file?.name ?? null,
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
        throw new Error(apiError.message ?? "The analysis request failed.");
      }
      const parsed = AnalysisResultSchema.parse(body);
      setResult(parsed);
      requestAnimationFrame(() => {
        document
          .querySelector("#evidence-map")
          ?.scrollIntoView({ behavior: "smooth" });
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis failed.");
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
        throw new Error(apiError.message ?? "The adversarial re-check failed.");
      }
      const parsed = ChallengeResultSchema.parse(body);
      setChallenges((current) => ({ ...current, [claimId]: parsed }));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The adversarial re-check failed.",
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
          <p className="eyebrow">Start with a claim</p>
          <h2 id="analyze-title">What should survive scrutiny?</h2>
        </div>
        <p>
          Submit public or non-sensitive material. Inputs are processed
          ephemerally and are not stored by Falsify.
        </p>
      </div>

      <form className="input-workbench" onSubmit={submit}>
        <div className="input-tabs" role="tablist" aria-label="Input type">
          {(["text", "url", "document"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={mode === item}
              onClick={() => {
                setMode(item);
                setError(null);
              }}
            >
              {item === "text"
                ? "Pasted text"
                : item === "url"
                  ? "Public URL"
                  : "Document"}
            </button>
          ))}
        </div>

        {mode === "url" ? (
          <label className="field-label">
            Public source URL
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
              <span>{file ? file.name : "Choose a text document"}</span>
              <small>TXT, Markdown, JSON, or CSV · 200 KB maximum</small>
              <input
                type="file"
                accept=".txt,.md,.json,.csv,text/plain,text/markdown,application/json,text/csv"
                onChange={(event) =>
                  void chooseFile(event.target.files?.[0] ?? null)
                }
              />
            </label>
            {content ? (
              <p>{content.length.toLocaleString()} characters ready</p>
            ) : null}
          </div>
        ) : (
          <label className="field-label">
            Statement, passage, or argument
            <textarea
              value={content}
              onChange={(event) =>
                setContent(event.target.value.slice(0, 30_000))
              }
              placeholder="Paste an evidence-dependent claim or short passage…"
              rows={8}
              minLength={8}
              required
            />
            <span className="character-count">
              {content.length.toLocaleString()} / 30,000
            </span>
          </label>
        )}

        <div className="input-actions">
          <p>
            External processing: live mode sends submitted content to OpenAI for
            analysis and public-web evidence search.
          </p>
          <button
            className="analyze-button"
            type="submit"
            disabled={!canSubmit}
          >
            {loading ? "Testing the evidence…" : "Falsify this claim"}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>

      {loading ? (
        <div className="analysis-progress" role="status" aria-live="polite">
          <span className="progress-pulse" />
          <div>
            <strong>Running separate evidence paths</strong>
            <p>
              Decomposing claims · seeking support · seeking contradiction ·
              auditing inference
            </p>
          </div>
        </div>
      ) : null}
      {error ? (
        <div className="analysis-error" role="alert">
          <strong>Analysis could not be completed.</strong>
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
              <p className="eyebrow">Evidence map</p>
              <h2 id="map-title">
                {result.claims.length} atomic claims under test
              </h2>
            </div>
            <div className="analysis-meta">
              <span>
                {result.mode === "live"
                  ? "Live GPT-5.6 analysis"
                  : "Limited local analysis"}
              </span>
              <span>{result.evidence.length} allowlisted sources</span>
            </div>
          </header>

          {result.limitations.length ? (
            <aside className="limitations-panel">
              <strong>Read before interpreting</strong>
              <ul>
                {result.limitations.map((limitation) => (
                  <li key={limitation}>{limitation}</li>
                ))}
              </ul>
            </aside>
          ) : null}

          <div className="map-layout">
            <nav className="claim-index" aria-label="Extracted claims">
              <p>Claim map</p>
              {result.claims.map((claim, index) => (
                <a key={claim.id} href={`#result-${claim.id}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{claim.normalized_claim}</strong>
                    <small>{claim.claim_type.replaceAll("_", " ")}</small>
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
