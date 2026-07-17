import { describe, expect, it } from "vitest";

import {
  isPublicIpAddress,
  PublicUrlError,
  validatePublicUrl,
} from "./public-url";

describe("public URL safety", () => {
  it.each([
    "127.0.0.1",
    "10.0.0.1",
    "169.254.169.254",
    "172.16.0.1",
    "192.168.0.1",
    "::1",
    "fc00::1",
    "fe80::1",
    "::ffff:127.0.0.1",
    "::ffff:7f00:1",
    "0:0:0:0:0:ffff:7f00:1",
  ])("rejects non-public address %s", (address) => {
    expect(isPublicIpAddress(address)).toBe(false);
  });

  it.each(["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"])(
    "accepts public address %s",
    (address) => {
      expect(isPublicIpAddress(address)).toBe(true);
    },
  );

  it.each([
    "http://localhost/",
    "http://127.0.0.1/",
    "http://2130706433/",
    "http://0x7f000001/",
    "http://169.254.169.254/latest/meta-data/",
    "https://[::1]/",
  ])("blocks local URL form %s", async (url) => {
    await expect(validatePublicUrl(url)).rejects.toBeInstanceOf(PublicUrlError);
  });

  it.each([
    "ftp://example.com/file",
    "https://user:pass@example.com/",
    "http://example.com:3000/",
    "https://example.com:80/",
  ])("blocks unsupported URL form %s", async (url) => {
    await expect(validatePublicUrl(url)).rejects.toBeInstanceOf(PublicUrlError);
  });

  it("rejects a hostname when any resolution is private", async () => {
    await expect(
      validatePublicUrl("https://example.test/", async () => [
        { address: "8.8.8.8", family: 4 },
        { address: "127.0.0.1", family: 4 },
      ]),
    ).rejects.toMatchObject({ code: "PRIVATE_NETWORK_BLOCKED" });
  });
});
