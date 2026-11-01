import { describe, expect, it } from "vitest";

import {
  challengeFlagshipFinding,
  flagshipAnalysis,
} from "@/lib/demo/flagship";

import { createJsonReport, createMarkdownReport } from "./report";

describe("portable analysis reports", () => {
  it("preserves source provenance and both finding versions in JSON without mutating the analysis", () => {
    const result = structuredClone(flagshipAnalysis);
    const before = structuredClone(result);
    const challenge = challengeFlagshipFinding("claim-2")!;
    result.search_suggestions_html = ["<div>Provider attribution</div>"];
    challenge.search_suggestions_html = ["<div>New attribution</div>"];

    const report = JSON.parse(
      createJsonReport(result, { "claim-2": challenge }),
    );

    expect(report.format).toBe("falsify-report");
    expect(report.schema_version).toBe("1.0");
    expect(report.analysis_generated_at).toBe(result.generated_at);
    expect(report.analysis.input.content).toBe(result.input.content);
    expect(report.analysis.claims[1].original_text).toBe(
      result.claims[1].original_text,
    );
    expect(report.analysis.evidence).toEqual(result.evidence);
    expect(report.analysis.findings).toEqual(before.findings);
    expect(report.latest_challenges[0].original_finding).toEqual(
      challenge.original_finding,
    );
    expect(report.latest_challenges[0].revised_finding).toEqual(
      challenge.revised_finding,
    );
    expect(report.latest_challenges[0].revised_finding.analysis).not.toBe(
      report.latest_challenges[0].original_finding.analysis,
    );
    expect(report.latest_challenges[0].new_evidence).toEqual(
      challenge.new_evidence,
    );
    expect(report.latest_challenges[0].outcome).toBe("qualified");
    expect(report.analysis.search_suggestions_html).toBeUndefined();
    expect(report.latest_challenges[0].search_suggestions_html).toBeUndefined();
    expect(result.findings).toEqual(before.findings);
    expect(result.search_suggestions_html).toEqual([
      "<div>Provider attribution</div>",
    ]);
  });

  it("makes original and revised reasoning identifiable in Markdown and retains every source URL", () => {
    const challenge = challengeFlagshipFinding("claim-2")!;
    const report = createMarkdownReport(
      flagshipAnalysis,
      { "claim-2": challenge },
      "en",
    );

    expect(report).toContain("### Initial analysis finding");
    expect(report).toContain("#### Finding before this re-check");
    expect(report).toContain("#### Finding after this re-check");
    expect(report).toContain(
      "Those proposal facts do not independently establish",
    );
    expect(report).toContain(
      "However, Japanese parliamentary material documents",
    );
    for (const source of [
      ...flagshipAnalysis.evidence,
      ...challenge.new_evidence,
    ]) {
      expect(report).toContain(source.url);
      expect(report).toContain(source.publisher!);
    }
    expect(report).toContain("2023\\-06");
    expect(report).toContain("Source summary; not a verified quotation");
    expect(report).toContain("The historical analogy remains unestablished");
    expect(report).toContain("Original excerpt from the submitted text");
  });

  it("keeps untrusted headings, HTML, and Markdown links as visible text", () => {
    const result = structuredClone(flagshipAnalysis);
    const injected =
      "Original text\n# Forged verdict\n<script>alert(1)</script>\n[run](javascript:alert(1))\n```html\n<img src=x>\n```";
    result.input.content = injected;
    result.claims[0].original_text = injected;
    result.claims[0].normalized_claim = injected;
    result.evidence[0].title = injected;
    result.evidence[0].excerpt = injected;
    result.evidence[0].notes = injected;
    result.limitations = [injected];
    result.search_suggestions_html = ["<div>DO-NOT-EXPORT-PROVIDER-HTML</div>"];

    const report = createMarkdownReport(result);

    expect(report).toContain("\\# Forged verdict");
    expect(report).toContain("&lt;script&gt;");
    expect(report).toContain("\\[run\\]");
    expect(report).not.toContain("\n# Forged verdict");
    expect(report).not.toContain("<script>");
    expect(report).not.toContain("<img");
    expect(report).not.toContain("[run](javascript:");
    expect(report).not.toContain("DO-NOT-EXPORT-PROVIDER-HTML");
    expect(JSON.parse(createJsonReport(result)).analysis.input.content).toBe(
      injected,
    );
  });

  it("omits unsafe clickable URLs and refuses to serialize them as validated report sources", () => {
    const result = structuredClone(flagshipAnalysis);
    result.evidence[0].url = "javascript:alert(1)";

    expect(createMarkdownReport(result)).toContain(
      "URL omitted because it is not a valid HTTP(S) link",
    );
    expect(createMarkdownReport(result)).not.toContain("](javascript:");
    expect(createMarkdownReport(result)).not.toContain("](<javascript:");
    expect(() => createJsonReport(result)).toThrow("not a valid HTTP(S) link");
  });

  it("preserves query strings while preventing a URL from closing its Markdown destination", () => {
    const result = structuredClone(flagshipAnalysis);
    result.evidence[0].url =
      'https://example.org/report?query=>(x)&label="quoted"';

    const report = createMarkdownReport(result);
    expect(report).toContain(
      "https://example.org/report?query=%3E(x)&label=%22quoted%22",
    );
    expect(JSON.parse(createJsonReport(result)).analysis.evidence[0].url).toBe(
      result.evidence[0].url,
    );
  });

  it("reports unknown legacy coverage honestly and preserves explicit selected-claim limits", () => {
    const legacy = JSON.parse(createJsonReport(flagshipAnalysis));
    expect(legacy.coverage).toEqual({
      scope: "selected_claims",
      analyzed_claims: flagshipAnalysis.claims.length,
      extracted_claims: null,
      analysis_limit: null,
      extraction_limit: null,
    });

    const result = {
      ...structuredClone(flagshipAnalysis),
      coverage: {
        scope: "selected_claims" as const,
        analyzed_claims: 4,
        extracted_claims: 8,
        analysis_limit: 4,
        extraction_limit: 8 as const,
      },
    };
    const json = JSON.parse(createJsonReport(result));
    const markdown = createMarkdownReport(result, {}, "ja");

    expect(json.coverage).toEqual(result.coverage);
    expect(markdown).toContain("分析した主張の件数: 4");
    expect(markdown).toContain("抽出した主張の件数: 8");
    expect(markdown).toContain(
      "すべての主張を抽出・確認したことを意味しません",
    );
  });

  it("requires source review even when no additional human-judgment flag is recorded", () => {
    const result = structuredClone(flagshipAnalysis);
    result.findings[0].human_judgment_required = false;
    result.findings[0].verdict = "INSUFFICIENT_EVIDENCE";

    const english = createMarkdownReport(result);
    const japanese = createMarkdownReport(result, {}, "ja");

    expect(english).toContain(
      "No additional flag; review the original sources",
    );
    expect(english).toContain(
      "Every finding requires review against the original sources",
    );
    expect(english).not.toContain("Human judgment required: No");
    expect(japanese).toContain(
      "追加の要確認フラグはありません。原資料の確認は必要です。",
    );
    expect(
      JSON.parse(createJsonReport(result)).analysis.findings[0]
        .human_judgment_required,
    ).toBe(false);
  });

  it("does not attach a re-check to a different claim", () => {
    const challenge = challengeFlagshipFinding("claim-2")!;
    const report = JSON.parse(
      createJsonReport(flagshipAnalysis, { "claim-1": challenge }),
    );

    expect(report.latest_challenges).toEqual([]);
    expect(report.analysis.findings).toEqual(flagshipAnalysis.findings);
  });
});
