import { Analyzer } from "@/components/analyzer";

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
          <a href="#principles">Principles</a>
          <a className="nav-action" href="#analyze">
            Start an audit
          </a>
        </nav>
      </header>

      <section className="product-hero" id="top">
        <p className="eyebrow">Adversarial evidence verification</p>
        <h1>
          Don’t trust the answer.
          <span>Inspect its evidence.</span>
        </h1>
        <div className="product-hero-foot">
          <p>
            Falsify breaks arguments into atomic claims, looks separately for
            what supports and weakens them, then exposes the complete evidence
            chain.
          </p>
          <p className="product-note">
            No truth score. No national ranking. No inference of deceptive
            intent without evidence.
          </p>
        </div>
      </section>

      <Analyzer />

      <section className="method" id="method" aria-labelledby="method-title">
        <div className="section-heading">
          <p className="eyebrow">The method</p>
          <h2 id="method-title">Built to look for failure, not agreement.</h2>
        </div>
        <div className="workflow-grid">
          <article>
            <span>01</span>
            <h3>Decompose</h3>
            <p>Separate a statement into atomic, testable propositions.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Falsify</h3>
            <p>Ask which observations would make each claim fail or narrow.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Investigate</h3>
            <p>
              Search for support and contradiction on deliberately separate
              paths.
            </p>
          </article>
          <article>
            <span>04</span>
            <h3>Challenge</h3>
            <p>
              Turn the same adversarial method back on Falsify’s own finding.
            </p>
          </article>
        </div>
      </section>

      <section className="principles" id="principles">
        <p className="eyebrow">Epistemic boundaries</p>
        <div>
          <h2>Uncertainty stays visible.</h2>
          <p>
            A missing source is not evidence of falsity. A real citation is not
            proof that it supports the sentence. A supported fact does not
            automatically establish the inference built on top of it.
          </p>
        </div>
      </section>

      <footer className="site-footer">
        <p>Open-source evidence verification · MIT licensed</p>
        <p>OpenAI Build Week 2026</p>
      </footer>
    </main>
  );
}
