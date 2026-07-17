import { describe, expect, it } from "vitest";

import { readJsonBody } from "./request";

describe("bounded JSON request reader", () => {
  it("parses a body at the byte limit", async () => {
    const body = '{"a":1}';
    await expect(
      readJsonBody(
        new Request("https://example.test", { method: "POST", body }),
        new TextEncoder().encode(body).byteLength,
      ),
    ).resolves.toEqual({ a: 1 });
  });

  it("rejects a streamed body over the byte limit", async () => {
    await expect(
      readJsonBody(
        new Request("https://example.test", {
          method: "POST",
          body: '{"value":"too large"}',
        }),
        10,
      ),
    ).rejects.toMatchObject({
      code: "REQUEST_TOO_LARGE",
      status: 413,
    });
  });

  it("rejects malformed JSON with a stable public error", async () => {
    await expect(
      readJsonBody(
        new Request("https://example.test", { method: "POST", body: "{" }),
        100,
      ),
    ).rejects.toMatchObject({
      code: "INVALID_JSON",
      status: 400,
    });
  });
});
