import { describe, expect, it } from "vitest";
import { decomposeClaimsLocally } from "@/lib/analysis/decompose";
import { limitUtf8, validateReviews, type Source } from "./review";

const claim = decomposeClaimsLocally("Electricity consumption fell by 20 percent.").claims[0];
const source: Source = { id: "source-1", claimId: claim.id, title: "A measured result", url: "https://example.org/report", text: "Electricity consumption fell by 20 percent in the measured facility.", path: "challenge-search candidate" };
const review = (sourceId = source.id, quote = source.text) => ({ reviews: [{ claim_id: claim.id, verdict: "SUPPORTED", analysis: "The measured result matches the claim.", unresolved: [], evidence: [{ source_id: sourceId, stance: "supporting", quote }] }] });

describe("body-grounded review", () => {
  it("accepts a matching excerpt regardless of search path", () => {
    const result = validateReviews([claim], [source], review());
    expect(result.findings[0].verdict).toBe("SUPPORTED");
    expect(result.evidence[0].url).toBe(source.url);
    expect(result.evidence[0].stance).toBe("supporting");
    expect(result.evidence[0].published_at).toBeNull();
  });
  it("withholds findings based on invented source IDs or quotations", () => {
    expect(validateReviews([claim], [source], review("invented")).findings[0].verdict).toBe("INSUFFICIENT_EVIDENCE");
    const result = validateReviews([claim], [source], review(source.id, "All facilities saw an identical 20 percent reduction."));
    expect(result.evidence).toHaveLength(0);
    expect(result.findings[0].analysis).not.toContain("matches the claim");
  });
  it("rejects cross-claim sources and missing reviews", () => {
    expect(validateReviews([claim], [{ ...source, claimId: "other-claim" }], review()).evidence).toHaveLength(0);
    expect(() => validateReviews([claim], [source], { reviews: [] })).toThrow();
    const changed = review();
    changed.reviews[0].claim_id = "invented";
    expect(() => validateReviews([claim], [source], changed)).toThrow();
  });
  it("does not treat empty evidence as a supported conclusion", () => {
    const empty = review();
    empty.reviews[0].evidence = [];
    expect(validateReviews([claim], [source], empty).findings[0].verdict).toBe("INSUFFICIENT_EVIDENCE");
  });
  it("bounds UTF-8 without corrupting Japanese characters", () => {
    expect(limitUtf8("日本語abcdef", 7)).toBe("日本");
    expect(Buffer.byteLength(limitUtf8("😀abcdef", 5))).toBe(5);
  });
});
