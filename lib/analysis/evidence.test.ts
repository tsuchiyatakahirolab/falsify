import { describe, expect, it } from "vitest";

import { validEvidenceFixture } from "@/lib/domain/fixtures";

import {
  extractCitationAllowlist,
  filterEvidenceByCitations,
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
});
