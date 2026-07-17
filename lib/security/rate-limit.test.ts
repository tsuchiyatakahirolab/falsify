import { beforeEach, describe, expect, it } from "vitest";

import {
  getRequestClientKey,
  rateLimitBucketCountForTests,
  resetRateLimitsForTests,
  takeRateLimit,
} from "./rate-limit";

describe("public demo rate limits", () => {
  beforeEach(resetRateLimitsForTests);

  it("allows the configured count and rejects the next request", () => {
    expect(takeRateLimit("analysis:one", 2, 1_000, 0).allowed).toBe(true);
    expect(takeRateLimit("analysis:one", 2, 1_000, 1).allowed).toBe(true);
    expect(takeRateLimit("analysis:one", 2, 1_000, 2)).toMatchObject({
      allowed: false,
      remaining: 0,
    });
    expect(takeRateLimit("analysis:one", 2, 1_000, 1_001).allowed).toBe(true);
  });

  it("trusts only the deployment-provided Vercel address header", () => {
    const spoofed = new Request("https://example.test", {
      headers: { "x-forwarded-for": "203.0.113.8" },
    });
    const trusted = new Request("https://example.test", {
      headers: {
        "x-forwarded-for": "203.0.113.8",
        "x-vercel-forwarded-for": "198.51.100.4, 10.0.0.1",
      },
    });
    expect(getRequestClientKey(spoofed)).toBe("anonymous");
    expect(getRequestClientKey(trusted)).toBe("198.51.100.4");
  });

  it("bounds active bucket growth under address spraying", () => {
    for (let index = 0; index < 2_100; index += 1) {
      takeRateLimit(`analysis:${index}`, 10, 60_000, 1);
    }
    expect(rateLimitBucketCountForTests()).toBeLessThanOrEqual(2_000);
  });
});
