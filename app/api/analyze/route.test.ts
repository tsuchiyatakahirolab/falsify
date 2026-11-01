import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

describe("Japanese input request size", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("accepts a schema-valid Japanese passage larger than 64 KiB", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("GEMINI_API_KEY", "");
    const content = "これは公開資料についての確認用文章です。"
      .repeat(1_400)
      .slice(0, 30_000);
    const body = JSON.stringify({
      type: "text",
      content,
      title: null,
      source_url: null,
      file_name: null,
      mime_type: null,
    });
    expect(new TextEncoder().encode(body).length).toBeGreaterThan(64 * 1_024);
    const response = await POST(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "192.0.2.72",
        },
        body,
      }),
    );
    expect(response.status).toBe(200);
    expect((await response.json()).input.content).toBe(content);
  });
});
