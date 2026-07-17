import { beforeEach, describe, expect, it } from "vitest";

import { flagshipAnalysis } from "@/lib/demo/flagship";
import { resetRateLimitsForTests } from "@/lib/security/rate-limit";

import { POST as analyze } from "./analyze/route";
import { POST as challenge } from "./challenge/route";

function post(url: string, body: string): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

describe("public API safety boundaries", () => {
  beforeEach(resetRateLimitsForTests);

  it("rejects malformed and oversized analysis bodies without caching", async () => {
    const malformed = await analyze(
      post("https://example.test/api/analyze", "{"),
    );
    expect(malformed.status).toBe(400);
    expect(malformed.headers.get("cache-control")).toContain("no-store");
    expect(await malformed.json()).toMatchObject({ error: "INVALID_JSON" });

    resetRateLimitsForTests();
    const oversized = await analyze(
      post(
        "https://example.test/api/analyze",
        JSON.stringify({ value: "x".repeat(70_000) }),
      ),
    );
    expect(oversized.status).toBe(413);
    expect(await oversized.json()).toMatchObject({
      error: "REQUEST_TOO_LARGE",
    });
  });

  it("blocks a loopback URL before retrieval", async () => {
    const response = await analyze(
      post(
        "https://example.test/api/analyze",
        JSON.stringify({
          type: "url",
          content: "http://127.0.0.1/private",
          title: null,
          source_url: "http://127.0.0.1/private",
          file_name: null,
          mime_type: null,
        }),
      ),
    );
    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({
      error: "PRIVATE_NETWORK_BLOCKED",
    });
  });

  it("returns 429 with Retry-After after the analysis quota", async () => {
    for (let index = 0; index < 8; index += 1) {
      const allowed = await analyze(
        post("https://example.test/api/analyze", "{"),
      );
      expect(allowed.status).toBe(400);
    }
    const blocked = await analyze(
      post("https://example.test/api/analyze", "{"),
    );
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("retry-after")).toBeTruthy();
  });

  it("accepts only the exact server-owned flagship bundle", async () => {
    const accepted = await challenge(
      post(
        "https://example.test/api/challenge",
        JSON.stringify({ analysis: flagshipAnalysis, claim_id: "claim-2" }),
      ),
    );
    expect(accepted.status).toBe(200);
    expect(await accepted.json()).toMatchObject({ outcome: "qualified" });

    resetRateLimitsForTests();
    const mutated = structuredClone(flagshipAnalysis);
    mutated.findings[1].analysis = "SECRET_MARKER client mutation";
    const rejected = await challenge(
      post(
        "https://example.test/api/challenge",
        JSON.stringify({ analysis: mutated, claim_id: "claim-2" }),
      ),
    );
    expect(rejected.status).toBe(400);
    expect(JSON.stringify(await rejected.json())).not.toContain(
      "SECRET_MARKER",
    );
  });
});
