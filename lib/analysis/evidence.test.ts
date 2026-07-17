import { describe, expect, it } from "vitest";

import { validEvidenceFixture } from "@/lib/domain/fixtures";

import {
  evidenceFromGeminiGrounding,
  extractCitationAllowlist,
  filterEvidenceByCitations,
  safeProviderFailureReason,
} from "./evidence";

const responseOutput = [
  {
    type: "message",
    content: [
      {
        type: "output_text",
        annotations: [
          {
            type: "url_citation",
            url: "https://example.gov/spending#table",
            title: "Verified official table",
          },
          {
            type: "url_citation",
            url: "https://example.org/challenge",
            title: "Verified challenge source",
          },
        ],
      },
    ],
  },
];

describe("evidence provenance", () => {
  it("extracts and normalizes only URL citation annotations", () => {
    const citations = extractCitationAllowlist(responseOutput);
    expect([...citations.keys()]).toEqual([
      "https://example.gov/spending",
      "https://example.org/challenge",
    ]);
  });

  it("keeps support and challenge paths distinct", () => {
    const citations = extractCitationAllowlist(responseOutput);
    const support = filterEvidenceByCitations(
      [validEvidenceFixture],
      citations,
      new Set(["claim-1"]),
      "support",
    );
    const challenge = filterEvidenceByCitations(
      [
        {
          ...validEvidenceFixture,
          id: "candidate-2",
          stance: "qualifying",
          url: "https://example.org/challenge",
          directness: "partially_supports",
        },
      ],
      citations,
      new Set(["claim-1"]),
      "challenge",
    );

    expect(support).toHaveLength(1);
    expect(challenge).toHaveLength(1);
    expect(support[0].stance).toBe("supporting");
    expect(challenge[0].stance).toBe("qualifying");
  });

  it("discards model-proposed URLs that were not cited by web search", () => {
    const evidence = filterEvidenceByCitations(
      [
        {
          ...validEvidenceFixture,
          url: "https://invented.example/source",
        },
      ],
      extractCitationAllowlist(responseOutput),
      new Set(["claim-1"]),
      "support",
    );
    expect(evidence).toEqual([]);
  });

  it("returns no evidence when the response contains no citations", () => {
    expect(
      filterEvidenceByCitations(
        [validEvidenceFixture],
        new Map(),
        new Set(["claim-1"]),
        "support",
      ),
    ).toEqual([]);
  });

  it("allowlists Gemini evidence by grounding source index", () => {
    const evidence = evidenceFromGeminiGrounding(
      {
        text: "[claim-1] The official table reports the stated figure.",
        sources: [
          {
            title: "Grounded official source",
            url: "https://example.gov/table",
          },
        ],
        supports: [
          {
            text: "[claim-1] The official table reports the stated figure.",
            sourceIndexes: [0, 99],
          },
        ],
        searchSuggestionHtml: "<div>Google Search</div>",
      },
      [
        {
          id: "claim-1",
          original_text: "The table reports the stated figure.",
          normalized_claim: "The table reports the stated figure",
          claim_type: "factual",
          testability: "empirically_testable",
          evidence_requirements: ["Official table"],
          falsification_questions: ["Does the table report another figure?"],
          time_sensitive: false,
          entities: [],
          source_span: null,
        },
      ],
      "support",
    );

    expect(evidence).toHaveLength(1);
    expect(evidence[0]).toMatchObject({
      title: "Grounded official source",
      url: "https://example.gov/table",
      stance: "supporting",
    });
    expect(evidence[0].notes).toContain("grounding metadata");
  });
});

describe("safe provider failure classification", () => {
  it("distinguishes common failures without echoing raw error details", () => {
    expect(safeProviderFailureReason({ status: 403 })).toContain("API key");
    expect(safeProviderFailureReason({ status: 429 })).toContain("quota");
    expect(safeProviderFailureReason({ status: 404 })).toContain("model");
    expect(
      safeProviderFailureReason(
        new Error("Gemini grounding attribution was not returned."),
      ),
    ).toContain("Search Suggestions");
    expect(safeProviderFailureReason(new Error("secret raw detail"))).toBe(
      "the Gemini request could not be completed",
    );
  });
});
