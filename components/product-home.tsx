"use client";

import { PRODUCT, TEACHING_EXAMPLE } from "@/lib/product/content";
import { Analyzer } from "./analyzer";
import { LanguageProvider, useLanguage } from "./language";

function ProductContent() {
  const { locale, setLocale, t } = useLanguage();
  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Falsify">
          <span className="wordmark-mark" aria-hidden="true">
            F
          </span>
          <span>
            Falsify<small>by TSUCHIYA LAB</small>
          </span>
        </a>
        <nav aria-label={t("Primary navigation", "主なページ")}>
          <a href="#example">{t("Example", "実例")}</a>
          <a href="#method">{t("Method", "方法")}</a>
          <a href={PRODUCT.repository}>GitHub</a>
          <button
            className="language-toggle"
            type="button"
            onClick={() => setLocale(locale === "ja" ? "en" : "ja")}
            aria-label={t("日本語に切り替える", "Switch to English")}
          >
            {locale === "ja" ? "English" : "日本語"}
          </button>
        </nav>
      </header>
      <section className="product-hero product-preview" id="top">
        <p className="eyebrow">
          {t("Public research preview", "研究用プレビューを公開中")}
        </p>
        <h1>
          {PRODUCT.title[locale]}
          <span>
            {t(
              "Keep uncertainty visible.",
              "確認が必要な箇所を、根拠とともに。",
            )}
          </span>
        </h1>
        <div className="product-hero-foot">
          <p>
            {t(
              "Review a short passage before publishing it. Falsify separates claims, searches for supporting and challenging evidence, and shows what remains unresolved.",
              "原稿を公開する前に、短い文章の主張と根拠を点検します。主張を分け、支持する資料と反証・限定を示す資料を探し、確認が残る箇所を示します。",
            )}
          </p>
          <p className="product-note">
            {t(
              "Inspect each source and make the final judgment. This preview checks selected claims; it does not review a complete manuscript.",
              "出典を確認し、最終的な判断は利用者が行います。このプレビューは抽出した一部の主張を対象とします。",
            )}
          </p>
        </div>
        <div className="hero-actions">
          <a className="button button-primary" href="#analyze">
            {t("Try Falsify", "Falsifyを試す")}{" "}
            <span aria-hidden="true">→</span>
          </a>
          <a className="button button-secondary" href="#example">
            {t("Read an example", "確認の例を見る")}
          </a>
        </div>
      </section>
      <section
        className="teaching-example"
        id="example"
        aria-labelledby="example-title"
      >
        <div className="section-heading">
          <p className="eyebrow">
            {t("An illustrative example", "確認方法を示す例")}
          </p>
          <h2 id="example-title">
            {t(
              "What does a 20% reduction establish?",
              "20%の減少から、何が言えるか。",
            )}
          </h2>
          <p>
            {t(
              "This invented passage illustrates the questions to ask. It is not a measured result or a verified Falsify finding.",
              "次の文章は説明用に作成した架空の例です。実測値やFalsifyによる検証済みの結果を示すものではありません。",
            )}
          </p>
        </div>
        <blockquote>{TEACHING_EXAMPLE[locale]}</blockquote>
        <div className="example-checks">
          {[
            [
              "01",
              t("Check the comparison", "比較条件を確認する"),
              t(
                "Which period, facility, baseline and workload produced the reported reduction?",
                "比較した期間、施設、基準値、稼働条件は何かを確認します。",
              ),
            ],
            [
              "02",
              t("Examine the causal claim", "因果関係を点検する"),
              t(
                "Could another change explain the decrease? Identify what would distinguish the explanations.",
                "消費電力の減少を説明する別の変化がなかったかを調べます。",
              ),
            ],
            [
              "03",
              t("Test the generalization", "一般化できる範囲を調べる"),
              t(
                "Which evidence supports expecting the same reduction at other facilities?",
                "他の施設でも同じ効果が得られると判断できる根拠を探します。",
              ),
            ],
          ].map(([number, title, body]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <Analyzer />
      <section className="method" id="method" aria-labelledby="method-title">
        <div className="section-heading">
          <p className="eyebrow">{t("The method", "確認の手順")}</p>
          <h2 id="method-title">
            {t(
              "Follow the claim through its evidence.",
              "主張から資料、判断までをたどる。",
            )}
          </h2>
        </div>
        <div className="workflow-grid">
          {[
            [
              "01",
              t("Separate claims", "主張を分ける"),
              t(
                "Identify the factual, causal, interpretive or normative parts of a passage.",
                "事実、因果関係、解釈、規範的判断を区別します。",
              ),
            ],
            [
              "02",
              t("Ask what could change the finding", "反証の条件を考える"),
              t(
                "State which evidence could overturn or narrow each claim.",
                "どのような証拠があれば主張を修正すべきかを示します。",
              ),
            ],
            [
              "03",
              t("Compare the evidence", "資料を照合する"),
              t(
                "Search separately for support and for evidence that challenges or qualifies it.",
                "支持する資料と反証・限定を示す資料を別々に探索します。",
              ),
            ],
            [
              "04",
              t("Re-check the finding", "判断を再検証する"),
              t(
                "Challenge Falsify's own finding, then export the evidence and remaining questions.",
                "Falsifyの判断自体を再検証し、資料と未解決の点を出力します。",
              ),
            ],
          ].map(([number, title, body]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="principles" id="principles">
        <p className="eyebrow">{t("Interpretation", "結果の読み方")}</p>
        <div>
          <h2>
            {t(
              "A qualified finding for each claim.",
              "主張ごとに、判断の範囲を示す。",
            )}
          </h2>
          <p>
            {t(
              "Missing evidence leaves a question open. A citation must support the specific sentence, and a factual premise does not establish every inference built on it. Falsify does not assign an overall truth score to people or documents.",
              "根拠が見つからない場合は未確認として扱います。出典が存在しても、その文章を支持するとは限りません。事実と、その事実から導く推論を分けて確認します。人物や文書全体に真偽の点数は付けません。",
            )}
          </p>
        </div>
      </section>
      <footer className="site-footer">
        <p>
          Falsify by <a href={PRODUCT.company}>TSUCHIYA LAB</a>
        </p>
        <p>
          <a href={PRODUCT.repository}>GitHub · MIT License</a> ·{" "}
          {t("Research preview", "研究用プレビュー")}
        </p>
      </footer>
    </main>
  );
}

export function ProductHome() {
  return (
    <LanguageProvider>
      <ProductContent />
    </LanguageProvider>
  );
}
