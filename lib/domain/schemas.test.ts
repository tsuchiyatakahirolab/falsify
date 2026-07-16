import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";

import claimJsonSchema from "../../schemas/claim.schema.json";
import evidenceJsonSchema from "../../schemas/evidence.schema.json";
import findingJsonSchema from "../../schemas/finding.schema.json";

import {
  validClaimFixture,
  validEvidenceFixture,
  validFindingFixture,
  validInputFixture,
} from "./fixtures";
import {
  ClaimSchema,
  EvidenceSchema,
  FindingSchema,
  InputSchema,
} from "./schemas";

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

const validateClaimJson = ajv.compile(claimJsonSchema);
const validateEvidenceJson = ajv.compile(evidenceJsonSchema);
const validateFindingJson = ajv.compile(findingJsonSchema);

describe("runtime domain schemas", () => {
  it("validates shared fixtures with Zod and the repository JSON Schemas", () => {
    expect(ClaimSchema.parse(validClaimFixture)).toEqual(validClaimFixture);
    expect(EvidenceSchema.parse(validEvidenceFixture)).toEqual(
      validEvidenceFixture,
    );
    expect(FindingSchema.parse(validFindingFixture)).toEqual(
      validFindingFixture,
    );
    expect(InputSchema.parse(validInputFixture)).toEqual(validInputFixture);

    expect(validateClaimJson(validClaimFixture)).toBe(true);
    expect(validateEvidenceJson(validEvidenceFixture)).toBe(true);
    expect(validateFindingJson(validFindingFixture)).toBe(true);
  });

  it("rejects invalid enums and additional fields", () => {
    expect(
      ClaimSchema.safeParse({ ...validClaimFixture, claim_type: "opinion" })
        .success,
    ).toBe(false);
    expect(
      EvidenceSchema.safeParse({
        ...validEvidenceFixture,
        invented_score: 0.95,
      }).success,
    ).toBe(false);
    expect(
      FindingSchema.safeParse({ ...validFindingFixture, verdict: "TRUE" })
        .success,
    ).toBe(false);
  });

  it("rejects unsafe provenance URLs and reversed source spans", () => {
    expect(
      EvidenceSchema.safeParse({
        ...validEvidenceFixture,
        url: "javascript:alert(1)",
      }).success,
    ).toBe(false);
    expect(
      ClaimSchema.safeParse({
        ...validClaimFixture,
        source_span: { start: 20, end: 4 },
      }).success,
    ).toBe(false);
  });

  it("enforces input-type metadata requirements", () => {
    expect(
      InputSchema.safeParse({
        ...validInputFixture,
        type: "url",
        source_url: null,
      }).success,
    ).toBe(false);
    expect(
      InputSchema.safeParse({
        ...validInputFixture,
        type: "document",
        file_name: null,
      }).success,
    ).toBe(false);
  });
});
