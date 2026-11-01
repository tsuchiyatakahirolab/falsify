# Falsify distribution copy

This file keeps the company website, GitHub explanation, and future directory descriptions consistent. The product is **Falsify by TSUCHIYA LAB**, an open-source research preview. These materials have not been submitted to Agensi or another directory, and the repository does not yet include an installable agent skill.

## Use the same identity and links

| Field | Description |
| --- | --- |
| Product | Falsify by TSUCHIYA LAB |
| Developer | TSUCHIYA LAB |
| English summary | Inspect the evidence behind each claim. |
| Japanese summary | 主張と根拠の対応を確認する。 |
| Availability | Open-source research preview. |
| Company | <https://tsuchiyalab.com/> |
| Company product page | <https://tsuchiyalab.com/products/falsify> |
| Web preview | <https://falsify-mu.vercel.app/> |
| Repository | <https://github.com/tsuchiyatakahirolab/falsify> |
| License | MIT. |
| Canonical explanation | [PRODUCT_OVERVIEW.md](PRODUCT_OVERVIEW.md). |

Use the product name in the listing title and the developer name in the publisher field or opening sentence. Use the company product page as the shared explanation of the workflow, examples, and current limits. Keep the source repository and web preview linked so that readers can inspect the implementation and try the prepared example.

## Concise English description

Falsify by TSUCHIYA LAB helps researchers, analysts, and editors examine the claims in a passage. It separates supporting evidence from evidence that contradicts or qualifies a claim, shows source links and remaining gaps, and lets the user challenge the finding. The open-source research preview includes a prepared public-source example; live evidence retrieval requires a configured provider and available quota. Analysis covers selected claims, up to five by default, so users should inspect the coverage and original sources.

## 日本語の短い説明

Falsifyは、TSUCHIYA LABが開発する、主張と根拠の対応を確認するためのツールです。主張を支持する資料と、反証や留保となる資料を分けて示し、資料へのリンクと未確認の点を残します。利用者はFalsify自身の判定を再検討することもできます。研究用プレビューには公開資料に基づく作成済みの例を用意しており、新たな資料検索にはモデルと検索の利用枠が必要です。1回の分析は既定で最大5件の抽出された主張を対象とするため、分析範囲と原資料を確認してください。

## Prepare a demonstration with the same narrative

Use the illustrative electricity example from [PRODUCT_OVERVIEW.md](PRODUCT_OVERVIEW.md) for the Japanese explanation. The English translation, numerical value, and checks must remain identical across the company page, repository, screenshots, and any later directory entry. Label the example as invented, and keep it separate from the curated public-source case prepared on 17 July 2026.

| Element | Demonstration specification |
| --- | --- |
| Japanese input | 新技術の導入により消費電力が20%減少した。したがって、どの施設でも導入すれば同じ削減効果が得られる。 |
| English translation | Introducing a new technology reduced electricity consumption by 20%. Therefore, every facility would achieve the same reduction by adopting it. |
| Required label | Illustrative example; invented figures and scenario; no external evidence supplied. / 説明用の架空の例です。実測値や外部資料を示していません。 |
| First inspection | Show the extracted claims and which part of the input they represent. |
| Evidence questions | Check the baseline and measurement conditions, alternative explanations, and the evidence required to generalize to other facilities. |
| Expected boundary | These are review questions, not completed findings. Questions without evidence remain unresolved; the 20% figure must not appear as verified performance. |
| Re-check | Explain that Falsify's own finding can be challenged; show this only through an implemented, verified path. |
| Export | The public preview exports Markdown and JSON, retaining source details and distinguishing original findings from the latest re-check. Both formats were verified on 1 November 2026. |

### Short demonstration script in English

The passage says electricity use fell by 20% after a new technology was introduced, then extends that result to every facility. This is an invented example. The measurement, the causal explanation, and the broader conclusion each require evidence, and Falsify makes the selected claims and remaining questions available for review. If the necessary evidence is missing, those questions remain unresolved. The reader can inspect the explanation and challenge Falsify's own conclusion.

### 日本語の短い説明台本

この文章は、新技術の導入で消費電力が20%減ったと述べ、その結果をすべての施設に当てはめています。これは説明用の架空の例です。数値の観測、因果関係の主張、ほかの施設への一般化にはそれぞれ根拠が必要であり、Falsifyでは抽出された主張と未確認の点を確認できます。資料がなければ、その論点は未確認として残します。利用者は説明を読み直し、Falsify自身の判定を再検討することもできます。

## Adapt the copy to the actual destination

| Destination | Appropriate content | Publication boundary |
| --- | --- | --- |
| Company website | Use the bilingual description, a worked example, links to the preview and repository, and a clear statement of the current scope. | Describe features that have been verified in the version linked from the page. |
| GitHub | Keep setup, provider configuration, input limits, examples, evaluation limits, license, and contribution information together. | Preserve dated Build Week materials as project history. |
| Agensi | Use the product identity, the specific verification task, an actual working skill if one is later prepared, and permitted documentation/repository links. | The current web application is not an installable skill. Do not submit it as one or add external paid-upgrade solicitations to the description. |
| skills.sh | Publish a usable skill in GitHub before documenting an installation command. | No skill installation command is included in the current release. |

An eventual agent skill must provide the task described in its listing. A name, an advertisement, or a link to the web application alone does not establish that the user can perform that task inside an agent. Its dependencies, supported agents, access requirements, and a reproducible example should be documented when that separate package exists.

## Describe the evidence accurately

Descriptions may state that the implementation separates support and challenge retrieval, preserves source links, and exposes qualified findings. Prepared examples must be identified as prepared, and invented examples must be identified as invented. Provider availability, partial results, and selected-claim coverage must remain visible wherever a reader could otherwise assume a complete live verification.

Claim extraction is capped at eight, while analysis defaults to five and can be configured from one to eight. Input is capped at 30,000 characters, and text files must also be no larger than 200,000 bytes. Overlong files and fetched URL content are rejected rather than silently truncated.

Do not state a measured accuracy rate, a measured time saving, or comprehensive detection of misinformation without an appropriate evaluation. Do not advertise PDF/Word ingestion, complete-paper checking, paid plans, or team features while they are outside the preview. Treat the original video and screenshot as July 2026 records until replacement assets have been checked against a released version.

## Track useful discovery

For each publication, record the destination, date, linked version, and the description used. Evaluate visits to the explanation or preview, completed example use where measured, substantive feedback, and relevant enquiries. Keep visits or installs distinct from active use and enquiries; these measures describe different outcomes.

The November 2026 update and company product page are public. Production checks on 1 November confirmed the prepared example, re-check, exports, language switching, and mobile layout; fresh evidence retrieval remains limited by provider quota. The repository still does not include an installable agent skill, and these materials have not been submitted to Agensi or another directory.
