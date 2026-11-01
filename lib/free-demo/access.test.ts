import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { budgetRules, createVisitor, networkPrefix, readVisitor, requestNetwork, requireSameOrigin, sealAnalysis, validAnalysis, boundedJson } from "./access";

beforeEach(() => vi.stubEnv("FALSIFY_DEMO_SECRET", "unit-test-secret-not-for-deployment-0123456789"));
afterEach(() => vi.unstubAllEnvs());

function request(cookie: string) {
  return new Request("https://example.test/api/analyze", { headers: { cookie: cookie.split(";")[0] } });
}

describe("anonymous trial identity", () => {
  it("uses a signed secure HttpOnly cookie without storing an IP", () => {
    const { visitor, cookie } = createVisitor();
    expect(readVisitor(request(cookie))?.key).toBe(visitor.key);
    expect(cookie).toContain("HttpOnly; Secure; SameSite=Lax");
    expect(visitor.key).not.toContain(visitor.id);
  });
  it("rejects altered, expired, duplicate and future cookies", () => {
    const now = Date.now();
    const { cookie } = createVisitor(now);
    expect(readVisitor(request(cookie.replace("trial", "forged").replace(/.$/, "x")), now + 31 * 86_400_000)).toBeNull();
    const token = cookie.split(";")[0];
    expect(readVisitor(request(`${token.slice(0, -1)}!`))).toBeNull();
    expect(readVisitor(new Request("https://example.test", { headers: { cookie: `${token}; ${token}` } }))).toBeNull();
    expect(readVisitor(request(createVisitor(now + 120_000).cookie), now)).toBeNull();
  });
  it("binds signed analysis to the visitor and exact result", () => {
    const visitor = createVisitor().visitor;
    const analysis = sealAnalysis({ id: "", findings: ["source reviewed"] }, visitor);
    expect(validAnalysis(analysis, visitor)).toBe(true);
    expect(validAnalysis({ ...analysis, findings: ["forged"] }, visitor)).toBe(false);
    expect(validAnalysis(analysis, createVisitor().visitor)).toBe(false);
    expect(validAnalysis(analysis, visitor, Date.now() + 2 * 86_400_000)).toBe(false);
  });
});

describe("network and origin boundaries", () => {
  it("normalizes IPv4 mapped addresses and IPv6 /64 networks", () => {
    expect(networkPrefix("203.0.113.7")).toBe("203.0.113.7");
    expect(networkPrefix("::ffff:203.0.113.7")).toBe("203.0.113.7");
    expect(networkPrefix("0:0:0:0:0:ffff:cb00:7107")).toBe("203.0.113.7");
    expect(networkPrefix("2001:db8:1:2::1")).toBe(networkPrefix("2001:0db8:0001:0002:ffff::2"));
    expect(networkPrefix("not-an-ip")).toBeNull();
  });
  it("does not trust client forwarding headers outside Vercel", () => {
    vi.stubEnv("VERCEL", "0");
    expect(() => requestNetwork(new Request("https://example.test", { headers: { "x-vercel-forwarded-for": "203.0.113.7" } }))).toThrow();
    vi.stubEnv("VERCEL", "1");
    expect(() => requestNetwork(new Request("https://example.test", { headers: { "x-forwarded-for": "203.0.113.7" } }))).toThrow();
    expect(requestNetwork(new Request("https://example.test", { headers: { "x-vercel-forwarded-for": "203.0.113.7" } }))).not.toContain("203.0.113.7");
  });
  it("requires the same origin and JSON for writes", () => {
    expect(() => requireSameOrigin(new Request("https://example.test/api", { headers: { origin: "https://attacker.test", "content-type": "application/json" } }))).toThrow();
    expect(() => requireSameOrigin(new Request("https://example.test/api", { headers: { origin: "https://example.test", "content-type": "application/json" } }))).not.toThrow();
  });
});

it("reserves all shared resources before any provider calls", () => {
  const { visitor } = createVisitor();
  const rules = budgetRules(visitor, "network-hash");
  expect(rules).toHaveLength(7);
  expect(rules[0].limit).toBe(3);
  expect(rules.find((rule) => rule.key.startsWith("search-month:"))).toMatchObject({ amount: 4, limit: 900 });
  expect(rules.find((rule) => rule.key.startsWith("tokens-minute:"))).toMatchObject({ amount: 7000, limit: 7000 });
  expect(new Set(rules.map((rule) => rule.key)).size).toBe(rules.length);
});

it("bounds upstream responses", async () => {
  await expect(boundedJson(new Response("too long"), 3)).rejects.toThrow();
  await expect(boundedJson(new Response("{}", { status: 429 }))).rejects.toThrow();
  await expect(boundedJson(Response.json({ ok: true }))).resolves.toEqual({ ok: true });
});
