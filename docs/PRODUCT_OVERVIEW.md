# Falsify by TSUCHIYA LAB

This page provides the shared product explanation for the repository and company website. It describes the research preview, separates prepared examples from live analysis, and keeps planned work distinct from available functions. See [README.md](../README.md) for setup and [DOCUMENTATION.md](../DOCUMENTATION.md) for dated verification records.

The updated [web preview](https://falsify-mu.vercel.app/) and [company product page](https://tsuchiyalab.com/products/falsify) are public. Checks on 1 November 2026 confirmed the prepared public-source example, its demonstration re-check, and Markdown/JSON exports. Fresh evidence retrieval remains quota-limited; a Japanese-input check returned two claims and no web evidence, and the result disclosed the unavailable evidence paths.

## English

### Inspect the evidence behind each claim

Falsify helps researchers, analysts, and editors examine the claims in a passage. It separates supporting evidence from evidence that contradicts or qualifies a claim, shows the sources and remaining gaps, and lets the user challenge the resulting finding. TSUCHIYA LAB develops this open-source research preview so that a reader can inspect the relationship between a claim, its evidence, and the inference drawn from it.

A reference may establish that two things happened together without establishing that one caused the other. Evidence from one setting may also leave a claim about every setting unresolved. Falsify organizes these distinctions for the reader and identifies where further checking is needed.

### Follow the claim through the evidence

The workflow starts with a short passage and extracts the propositions that can be examined. For each proposition, Falsify asks what evidence could disprove or narrow it, separates supporting and challenging sources, and checks whether the inference fits those sources. A finding retains the source links, evidence gaps, and limitations so that the reader can review the reasoning.

The reader can then challenge Falsify's own finding. The re-check records whether the finding holds, is qualified, changes, or remains unresolved. Both the first finding and the re-check remain available for comparison in the result.

### An illustrative example

> Introducing a new technology reduced electricity consumption by 20%. Therefore, every facility would achieve the same reduction by adopting it.

This is an invented teaching example. It does not describe a real technology, facility, study, or measured result, and it supplies no external evidence. Its purpose is to show why a numerical observation, an attribution of causation, and a general conclusion need separate checks.

| Part of the passage | What needs to be checked |
| --- | --- |
| Electricity use fell by 20%. | The baseline, measurement period, workload, and units need to be comparable. |
| The new technology caused the reduction. | The evidence must address other changes that could explain the difference. |
| Any facility will obtain the same reduction. | Evidence from other facilities or clearly defined applicability conditions is needed. |

These are expected review questions, not findings from a completed analysis. Without the relevant materials, the result should leave the questions unresolved rather than turn the invented number into verified performance. The same standard applies when reviewing a counterclaim or Falsify's own explanation.

### What is available in the preview

The application accepts pasted text, public text-based URLs, and TXT, Markdown, JSON, or CSV files. Input is limited to 30,000 characters, text files to 200,000 bytes, and claim extraction to eight candidates. Analysis covers up to five claims by default, configurable from one to eight; the coverage display shows the counts and limits without asserting complete document coverage.

Overlong files and fetched URL content are rejected instead of silently truncated. The user can select a shorter passage and see which extracted claims are included in the analysis. Sentence splitting handles English, Japanese, and Chinese punctuation, while the interface offers English and Japanese controls.

The existing public-source example was prepared on 17 July 2026 and can be loaded without an API key. It distinguishes a budget proposal, a historical analogy, and reciprocal attributions of intent, using prepared sources and findings. A live analysis instead requires a configured provider and available model/search quota, and its output must disclose any unavailable evidence path.

The Japanese illustrative input above is available in the updated interface as a sample to examine, not as a completed evidence review. Markdown and JSON downloads preserve the analysis, source metadata, limitations, and the latest re-check per claim, with original and revised findings kept distinct. PDF and Word parsing, full-manuscript review, accounts, billing, and team workspaces are outside the preview.

### Inspect the sources and the limits

Falsify presents a claim-level assessment for a person to review. Its deterministic tests cover selected rules; they do not establish general factual accuracy or replace examination of the original materials. Evidence summaries are not verified quotations, and missing evidence does not establish that a claim is false.

The application has no permanent manuscript database. Live analysis may send input to model and search providers, so the shared preview should be used with public or non-confidential material. The [security and privacy documentation](SECURITY_PRIVACY.md) explains these boundaries and the implemented controls.

## 日本語

更新版の[研究用プレビュー](https://falsify-mu.vercel.app/)と[会社の商品説明ページ](https://tsuchiyalab.com/products/falsify)を公開しました。2026年11月1日に、作成済みの公開資料例、判定の再検討、Markdown・JSON出力を確認しています。新たな資料検索には利用枠の制約があり、日本語入力の確認では主張2件に対して資料を取得できず、検索できなかった経路と制約を結果に表示しました。

### 主張と根拠の対応を確認する

Falsifyは、研究者、調査担当者、編集者が文章中の主張と根拠の対応を確認するためのツールです。主張を支持する資料と、反証や留保となる資料を分けて示し、資料から確認できることと未確認のことを整理します。TSUCHIYA LABが開発するオープンソースの研究用プレビューとして、利用者が判定の根拠を読み直し、その判定自体を再検討できるようにしています。

ある資料から2つの事象が同時に起きたことを確認できても、一方が他方の原因だったとは限りません。1つの条件で得られた結果を、ほかの条件にも当てはめられるかという問題も残ります。Falsifyは、こうした主張と推論の違いを整理し、追加で確認すべき点を示します。

### 主張ごとに資料をたどる

利用者が短い文章を入力すると、Falsifyは確認対象となる主張を抽出します。それぞれについて、どのような証拠があれば主張を否定・限定できるかを問い、支持資料と反証・留保となる資料を分けて示します。判定には資料へのリンク、根拠が不足する点、分析上の限界を残し、利用者が説明を確認できるようにします。

利用者は、Falsify自身の判定を再検討することもできます。再検討の結果は、判定の維持、留保の追加、変更、未解決のいずれに当たるかを記録します。元の判定と再検討後の判定を比較することで、追加資料が説明に与えた影響を確認できます。

### 数値と因果関係を分けて考える

> 新技術の導入により消費電力が20%減少した。したがって、どの施設でも導入すれば同じ削減効果が得られる。

これは説明用に作成した架空の例です。実在する技術、施設、研究、測定結果を示すものではなく、外部の証拠資料も付していません。数値の観測、因果関係の主張、ほかの条件への一般化を分けて確認するために用います。

| 文章中の主張 | 確認すること |
| --- | --- |
| 消費電力が20%減少したと述べています。 | 比較の基準、測定期間、処理量、単位がそろっているかを確認します。 |
| 新技術の導入が減少の原因だと述べています。 | ほかに変わった条件が結果を説明しないかを確認します。 |
| どの施設でも同じ削減効果が得られると述べています。 | 別の施設での検証結果や、効果を見込める条件が示されているかを確認します。 |

これは確認すべき論点を示したもので、分析を実行した結果ではありません。必要な資料がなければ該当する論点を未確認として残し、説明用の数値を実証済みの性能として扱わないことが必要です。反論やFalsify自身の説明を確認するときにも、同じ基準を適用します。

### 現在のプレビューでできること

現在は、文章の貼り付け、公開URL、TXT・Markdown・JSON・CSVのテキストファイルを入力できます。入力は最大30,000文字、ファイルは最大200,000バイト、主張の抽出は最大8件とし、分析は既定で最大5件に制限しています。自分で運用する場合は分析上限を1〜8件に設定できますが、件数の表示は全文の確認を意味しないため、抽出された主張を確認したうえで結果を読んでください。

文字数の上限を超えるファイルやURLの内容は、切り詰めずに読み込みを中止します。利用者は対象とする箇所を選び直し、どの主張を分析したかを確認できます。文区切りは英語・日本語・中国語の句読点に対応し、画面の操作案内は日本語と英語を選べます。

公開資料に基づく作成済みの例は、2026年7月17日に準備した資料と判定を表示します。予算案に関する記述、歴史的類推、相手の意図に関する主張を分けて確認する例で、APIキーなしで利用できます。新たに資料を検索する分析にはモデルと検索の利用枠が必要であり、検索できなかった場合はその制約を表示します。

更新した画面では、上記の日本語の架空例を確認用の入力として読み込めます。Markdown・JSONのレポートには分析結果、資料の情報、限界、主張ごとの最新の再検討結果を収録し、元の判定と再検討後の判定を分けて残します。PDF・Wordの読み込み、論文全体の確認、アカウント、課金、共同作業の機能は、現在のプレビューには含めていません。

### 資料と分析の限界を確認する

Falsifyの判定は、利用者が資料と照合して確認するためのものです。特定の処理を確認するテストに合格していても、幅広い主題での正確性を実証したことにはなりません。資料の要約は原文を確認した直接引用とは区別し、証拠が見つからないことだけを理由に主張を誤りと判断しません。

このアプリには原稿を恒久保存するデータベースを設けていません。ただし、検索を伴う分析ではモデルや検索サービスに入力内容が送られる場合があるため、共有プレビューでは公開資料や機密性のない文章を使用してください。詳しい取扱いと実装上の対策は、[データの取扱いに関する文書](SECURITY_PRIVACY.md)で確認できます。
