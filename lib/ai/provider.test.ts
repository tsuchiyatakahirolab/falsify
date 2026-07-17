import { afterEach, describe, expect, it } from "vitest";

import { getLiveProvider } from "./provider";

const original = {
  provider: process.env.AI_PROVIDER,
  openai: process.env.OPENAI_API_KEY,
  gemini: process.env.GEMINI_API_KEY,
};

afterEach(() => {
  if (original.provider === undefined) delete process.env.AI_PROVIDER;
  else process.env.AI_PROVIDER = original.provider;
  if (original.openai === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = original.openai;
  if (original.gemini === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = original.gemini;
});

describe("live model provider selection", () => {
  it("uses Gemini when it is the only configured live provider", () => {
    delete process.env.OPENAI_API_KEY;
    process.env.GEMINI_API_KEY = "test-gemini-key";
    delete process.env.AI_PROVIDER;
    expect(getLiveProvider()).toBe("gemini");
  });

  it("honors an explicit provider without silently crossing providers", () => {
    process.env.OPENAI_API_KEY = "test-openai-key";
    process.env.GEMINI_API_KEY = "test-gemini-key";
    process.env.AI_PROVIDER = "gemini";
    expect(getLiveProvider()).toBe("gemini");

    delete process.env.GEMINI_API_KEY;
    expect(getLiveProvider()).toBeNull();
  });
});
