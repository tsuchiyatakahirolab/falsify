import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";

export const TRIAL_LIMIT = 3;
export const TRIAL_DAYS = 30;
export const INPUT_LIMIT = 800;
export const CLAIM_LIMIT = 2;
const DAY = 86_400_000;
const COOKIE = "__Host-falsify_demo";

export class DemoError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 503,
    public readonly retryAfter = 60,
  ) {
    super(message);
    this.name = "DemoError";
  }
}

export function publicDemoEnabled(): boolean {
  return process.env.FALSIFY_PUBLIC_DEMO === "true";
}

export function configured(): boolean {
  return Boolean(
    process.env.GROQ_API_KEY &&
      process.env.TAVILY_API_KEY &&
      process.env.FALSIFY_DEMO_DATABASE_URL &&
      (process.env.FALSIFY_DEMO_SECRET?.length ?? 0) >= 32,
  );
}

function secret(): string {
  const value = process.env.FALSIFY_DEMO_SECRET;
  if (!value || value.length < 32) {
    throw new DemoError("DEMO_UNAVAILABLE", "新規検索は準備中です。保存済みデモをご利用ください。 Live search is not configured.");
  }
  return value;
}

export function digest(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function equal(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export type Visitor = { id: string; issued: number; expires: number; key: string };

export function createVisitor(now = Date.now()): { visitor: Visitor; cookie: string } {
  const id = randomUUID();
  const issued = Math.floor(now / 1_000) * 1_000;
  const payload = `${id}.${issued}`;
  return {
    visitor: { id, issued, expires: issued + TRIAL_DAYS * DAY, key: digest(`visitor:${payload}`) },
    cookie: `${COOKIE}=${payload}.${digest(`cookie:${payload}`)}; Path=/; Max-Age=${TRIAL_DAYS * 86_400}; HttpOnly; Secure; SameSite=Lax`,
  };
}

export function readVisitor(request: Request, now = Date.now()): Visitor | null {
  const values = (request.headers.get("cookie") ?? "").split(";").map((part) => part.trim()).filter((part) => part.startsWith(`${COOKIE}=`));
  if (values.length !== 1) return null;
  const token = values[0].slice(COOKIE.length + 1);
  if (token.length > 180) return null;
  const [id, timestamp, signature, extra] = token.split(".");
  if (extra !== undefined || !/^[0-9a-f-]{36}$/i.test(id ?? "") || !/^\d{13}$/.test(timestamp ?? "") || !signature) return null;
  const issued = Number(timestamp);
  if (issued > now + 60_000 || issued + TRIAL_DAYS * DAY <= now) return null;
  if (!equal(signature, digest(`cookie:${id}.${timestamp}`))) return null;
  return { id, issued, expires: issued + TRIAL_DAYS * DAY, key: digest(`visitor:${id}.${timestamp}`) };
}

export function networkPrefix(address: string): string | null {
  let value = address.trim().toLowerCase();
  if (value.startsWith("::ffff:") && isIP(value.slice(7)) === 4) value = value.slice(7);
  const version = isIP(value);
  if (version === 4) return value;
  if (version !== 6) return null;
  // Expand IPv6 and group privacy addresses from the same /64 network.
  if (value.includes(".")) {
    const split = value.lastIndexOf(":");
    const octets = value.slice(split + 1).split(".").map(Number);
    value = `${value.slice(0, split)}:${((octets[0] << 8) | octets[1]).toString(16)}:${((octets[2] << 8) | octets[3]).toString(16)}`;
  }
  const sides = value.split("::");
  const left = sides[0] ? sides[0].split(":") : [];
  const right = sides[1] ? sides[1].split(":") : [];
  const groups = sides.length === 2 ? [...left, ...Array(8 - left.length - right.length).fill("0"), ...right] : left;
  const normalized = groups.map((part) => Number.parseInt(part, 16));
  if (normalized.slice(0, 5).every((part) => part === 0) && normalized[5] === 0xffff) {
    return `${normalized[6] >> 8}.${normalized[6] & 255}.${normalized[7] >> 8}.${normalized[7] & 255}`;
  }
  return `${normalized.slice(0, 4).map((part) => part.toString(16)).join(":")}::/64`;
}

export function requestNetwork(request: Request): string {
  // Only Vercel's platform-provided client address is trusted. Do not use X-Forwarded-For.
  const address = process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0] : null;
  const prefix = address ? networkPrefix(address) : null;
  if (!prefix) throw new DemoError("NETWORK_UNAVAILABLE", "接続元を確認できないため新規検索を停止しました。 The trusted client address is unavailable.");
  return digest(`network:${prefix}`);
}

export function requireSameOrigin(request: Request): void {
  if (request.headers.get("origin") !== new URL(request.url).origin || !request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new DemoError("INVALID_ORIGIN", "このページから操作をやり直してください。 Submit from this page.", 403);
  }
}

export type Rule = { key: string; amount: number; limit: number; expires_at: string; reason: string };
export type Counter = { key: string; used: number; expires_at: string };
export type Reservation = { allowed: boolean; reason: string | null; counters: Counter[] };

export function budgetRules(visitor: Visitor, network: string, now = Date.now()): Rule[] {
  const minute = Math.floor(now / 60_000);
  const day = Math.floor(now / DAY);
  const date = new Date(now);
  const month = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`;
  const nextMonth = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
  const rule = (key: string, amount: number, limit: number, expiry: number, reason: string): Rule => ({ key, amount, limit, expires_at: new Date(expiry).toISOString(), reason });
  return [
    rule(`trial:${visitor.key}`, 1, TRIAL_LIMIT, visitor.expires, "TRIAL_LIMIT"),
    rule(`ip-day:${network}:${day}`, 1, 12, (day + 1) * DAY, "NETWORK_LIMIT"),
    rule(`ip-minute:${network}:${minute}`, 1, 4, (minute + 1) * 60_000, "NETWORK_LIMIT"),
    rule(`global-day:${day}`, 1, 20, (day + 1) * DAY, "DAILY_LIMIT"),
    rule(`search-month:${month}`, 4, 900, nextMonth, "MONTHLY_LIMIT"),
    rule(`tokens-day:${day}`, 7_000, 180_000, (day + 1) * DAY, "DAILY_LIMIT"),
    rule(`tokens-minute:${minute}`, 7_000, 7_000, (minute + 1) * 60_000, "BUSY"),
  ];
}

export async function boundedJson(response: Response, maxBytes = 256_000): Promise<unknown> {
  if (!response.ok) throw new DemoError("UPSTREAM_UNAVAILABLE", "外部サービスが応答できませんでした。利用回数は返却されます。 The provider could not complete the request.", 502);
  if (!response.body) throw new DemoError("EMPTY_RESPONSE", "外部サービスの応答が空でした。", 502);
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) throw new DemoError("RESPONSE_TOO_LARGE", "外部サービスの応答が上限を超えました。", 502);
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } finally {
    await reader.cancel().catch(() => undefined);
  }
}

export async function quotaQuery(query: string, params: string[]): Promise<unknown> {
  const connection = process.env.FALSIFY_DEMO_DATABASE_URL;
  if (!connection) throw new DemoError("DEMO_UNAVAILABLE", "利用回数の管理を準備中です。 The quota store is not configured.");
  const url = new URL(connection);
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname.endsWith(".neon.tech")) throw new DemoError("DEMO_UNAVAILABLE", "利用回数の管理を利用できません。");
  const result = await boundedJson(await fetch(`https://${url.hostname.replace("-pooler.", ".")}/sql`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Neon-Connection-String": connection, "Neon-Raw-Text-Output": "true", "Neon-Array-Mode": "true" },
    body: JSON.stringify({ query, params }),
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  })) as { rows?: unknown[][] };
  const value = result.rows?.[0]?.[0];
  return typeof value === "string" ? JSON.parse(value) : value;
}

export async function reserve(visitor: Visitor, network: string): Promise<{ id: string; remaining: number }> {
  const rules = budgetRules(visitor, network);
  const id = randomUUID();
  const result = await quotaQuery("SELECT falsify_demo_reserve($1::uuid, $2::jsonb, ARRAY(SELECT jsonb_array_elements_text($3::jsonb)))", [id, JSON.stringify(rules), JSON.stringify([rules[0].key, rules[1].key])]) as Reservation;
  if (!result || typeof result.allowed !== "boolean" || !Array.isArray(result.counters)) throw new DemoError("STORE_UNAVAILABLE", "利用回数を確認できませんでした。安全のため新規検索を停止しています。");
  if (!result.allowed) {
    const rule = rules.find((item) => item.reason === result.reason);
    const retry = rule ? Math.max(1, Math.ceil((Date.parse(rule.expires_at) - Date.now()) / 1_000)) : 60;
    const message = result.reason === "TRIAL_LIMIT" ? "このブラウザの無料体験3回を使い切りました。保存済みデモは引き続き閲覧できます。 Your three trial operations have been used."
      : result.reason === "BUSY" ? "共通の無料枠を使用中です。少し時間を空けて再度お試しください。 Shared capacity is temporarily busy."
      : "無料枠または接続元の上限に達しました。保存済みデモをご利用ください。 A shared or network limit has been reached.";
    throw new DemoError(result.reason ?? "DEMO_LIMIT", message, 429, retry);
  }
  const used = result.counters.find((item) => item.key === rules[0].key)?.used;
  if (!Number.isInteger(used)) throw new DemoError("STORE_UNAVAILABLE", "利用回数の応答を確認できませんでした。");
  return { id, remaining: Math.max(0, TRIAL_LIMIT - Number(used)) };
}

export async function refund(id: string): Promise<void> {
  await quotaQuery("SELECT falsify_demo_refund($1::uuid)", [id]);
}

export async function remaining(visitor: Visitor): Promise<number> {
  const count = await quotaQuery("SELECT to_jsonb(COALESCE((SELECT used FROM falsify_demo_counters WHERE key = $1 AND expires_at > now()), 0))", [`trial:${visitor.key}`]);
  if (!Number.isInteger(count) || Number(count) < 0) throw new DemoError("STORE_UNAVAILABLE", "利用回数を確認できませんでした。");
  return Math.max(0, TRIAL_LIMIT - Number(count));
}

export function sealAnalysis<T extends { id: string }>(analysis: T, visitor: Visitor): T {
  const id = `${randomUUID()}.${Date.now()}`;
  const signature = digest(`analysis:${visitor.key}:${id}:${JSON.stringify({ ...analysis, id: "" })}`);
  return { ...analysis, id: `trial.${id}.${signature}` };
}

export function validAnalysis<T extends { id: string }>(analysis: T, visitor: Visitor, now = Date.now()): boolean {
  const [prefix, uuid, timestamp, signature, extra] = analysis.id.split(".");
  if (prefix !== "trial" || extra !== undefined || !uuid || !signature || !/^\d{13}$/.test(timestamp ?? "")) return false;
  const issued = Number(timestamp);
  if (issued > now + 60_000 || now - issued > DAY) return false;
  return equal(signature, digest(`analysis:${visitor.key}:${uuid}.${timestamp}:${JSON.stringify({ ...analysis, id: "" })}`));
}
