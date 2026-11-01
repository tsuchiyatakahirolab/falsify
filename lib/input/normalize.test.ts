import { afterEach, describe, expect, it, vi } from "vitest";

import * as publicUrl from "@/lib/security/public-url";

import { normalizeInput } from "./normalize";

const urlInput = {
  type: "url",
  content: "https://example.test/report",
  source_url: "https://example.test/report",
  title: null,
  file_name: null,
  mime_type: null,
};

describe("input normalization boundaries", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(["text/plain", "text/html"])(
    "rejects oversized readable %s sources instead of silently dropping the ending",
    async (contentType) => {
      const content = "あ".repeat(30_000) + "最後の重要な主張。";
      vi.spyOn(publicUrl, "fetchPublicText").mockResolvedValue({
        body: contentType === "text/html" ? `<p>${content}</p>` : content,
        contentType,
        finalUrl: urlInput.source_url,
        status: 200,
      });

      await expect(normalizeInput(urlInput)).rejects.toMatchObject({
        name: "PublicUrlError",
        code: "INPUT_TOO_LONG",
        message: expect.stringContaining("30,000"),
      });
    },
  );

  it("accepts all readable content at the limit, independent of HTML markup size", async () => {
    const content = "あ".repeat(29_999) + "終";
    vi.spyOn(publicUrl, "fetchPublicText").mockResolvedValue({
      body: `<script>${"x".repeat(2_000)}</script><p>${content}</p>`,
      contentType: "text/html",
      finalUrl: urlInput.source_url,
      status: 200,
    });

    const result = await normalizeInput(urlInput);
    expect(result.content).toBe(content);
    expect(result.content).toHaveLength(30_000);
  });

  it.each(["text", "document"])(
    "preserves schema-validated %s content and rejects oversized submissions",
    async (type) => {
      const input = {
        type,
        content: `  ${"あ".repeat(29_996)}  `,
        source_url: null,
        title: null,
        file_name: type === "document" ? "source.txt" : null,
        mime_type: type === "document" ? "text/plain" : null,
      };
      expect((await normalizeInput(input)).content).toBe(input.content);
      await expect(
        normalizeInput({ ...input, content: input.content + "終" }),
      ).rejects.toMatchObject({ name: "ZodError" });
    },
  );
});
