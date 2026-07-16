const workflow = [
  ["01", "Decompose", "Separate a statement into atomic, testable claims."],
  ["02", "Falsify", "Ask what evidence would make each claim fail."],
  ["03", "Investigate", "Seek support and contradiction on separate paths."],
  ["04", "Inspect", "Trace every finding back to its evidence and source."],
] as const;

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Falsify home">
          <span className="wordmark-mark" aria-hidden="true">
            F
          </span>
          <span>Falsify</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#method">Method</a>
          <a href="#evidence-map">Evidence map</a>
          <a className="nav-action" href="#start">
            Start an audit
          </a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Adversarial evidence verification</p>
          <h1>
            Don’t trust the answer.
            <span>Inspect its evidence.</span>
          </h1>
          <p className="hero-intro">
            Falsify breaks arguments into claims, searches for what supports and
            weakens them, and makes every conclusion challengeable.
          </p>
          <div className="hero-actions" id="start">
            <a className="button button-primary" href="#evidence-map">
              See how it works
              <span aria-hidden="true">↗</span>
            </a>
            <a className="button button-secondary" href="#method">
              Explore the method
            </a>
          </div>
          <p className="product-note">
            No truth score. No political ranking. Just an inspectable
            claim–evidence chain.
          </p>
        </div>

        <div className="hero-panel" id="evidence-map">
          <div className="panel-topline">
            <span>Evidence map</span>
            <span className="analysis-state">
              <i aria-hidden="true" /> Analysis preview
            </span>
          </div>
          <article className="claim-card">
            <div className="claim-meta">
              <span>Claim 02</span>
              <span>Historical analogy</span>
            </div>
            <p className="claim-text">
              The documented increase alone establishes a return to an earlier
              political ideology.
            </p>
            <div className="falsification-prompt">
              <span className="prompt-icon" aria-hidden="true">
                ?
              </span>
              <div>
                <span>What would make this wrong?</span>
                <p>
                  Evidence that the increase has alternative policy
                  explanations, or that the analogy’s defining features are
                  absent.
                </p>
              </div>
            </div>
            <div className="evidence-grid">
              <div className="evidence-column support">
                <span className="column-label">Supported core</span>
                <strong>Expenditure increased</strong>
                <p>Primary budget records confirm the factual change.</p>
                <span className="source-line">Official data · Direct</span>
              </div>
              <div className="evidence-column challenge">
                <span className="column-label">Challenge</span>
                <strong>Analogy not established</strong>
                <p>
                  The factual change does not independently prove the analogy.
                </p>
                <span className="source-line">
                  Inference audit · Unresolved
                </span>
              </div>
            </div>
            <footer className="finding-row">
              <div>
                <span>Qualified finding</span>
                <strong>Partially supported</strong>
              </div>
              <button type="button" disabled>
                Challenge this finding
                <span aria-hidden="true">→</span>
              </button>
            </footer>
          </article>
          <p className="preview-caption">
            Illustrative interface · Live analysis arrives in the next
            milestones
          </p>
        </div>
      </section>

      <section className="method" id="method" aria-labelledby="method-title">
        <div className="section-heading">
          <p className="eyebrow">The method</p>
          <h2 id="method-title">Built to look for failure, not agreement.</h2>
        </div>
        <div className="workflow-grid">
          {workflow.map(([number, title, description]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <p>Falsify is open source and built for inspectable uncertainty.</p>
        <p>OpenAI Build Week 2026</p>
      </footer>
    </main>
  );
}
