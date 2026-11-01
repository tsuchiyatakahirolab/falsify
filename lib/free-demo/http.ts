import { z, ZodError } from "zod";
import { challengeFinding } from "@/lib/analysis/challenge";
import { FLAGSHIP_DEMO_ID, flagshipAnalysis } from "@/lib/demo/flagship";
import { AnalysisResultSchema, ChallengeResultSchema, InputSchema } from "@/lib/domain/schemas";
import { normalizeInput } from "@/lib/input/normalize";
import { NO_STORE_HEADERS, readJsonBody, RequestBodyError } from "@/lib/security/request";
import { PublicUrlError } from "@/lib/security/public-url";
import { getRequestClientKey, takeRateLimit } from "@/lib/security/rate-limit";
import { configured, createVisitor, DemoError, INPUT_LIMIT, readVisitor, refund, remaining, requestNetwork, requireSameOrigin, reserve, sealAnalysis, TRIAL_DAYS, TRIAL_LIMIT, validAnalysis } from "./access";
import { reviewInput } from "./review";

const ChallengeRequest = z.object({ analysis: AnalysisResultSchema, claim_id: z.string().min(1) }).strict();

function requireVisitor(request: Request) {
  if (!configured()) throw new DemoError("DEMO_NOT_CONFIGURED", "新規検索は準備中です。保存済みデモは利用できます。 Live search is awaiting provider configuration.");
  const visitor = readVisitor(request);
  if (!visitor) throw new DemoError("SESSION_REQUIRED", "ページを再読み込みして、無料体験の利用状況を確認してください。 Reload the page to initialize the trial.", 409);
  return visitor;
}

function resultHeaders(count?: number): Record<string, string> {
  return { ...NO_STORE_HEADERS, "X-Demo-Limit": String(TRIAL_LIMIT), ...(count === undefined ? {} : { "X-Demo-Remaining": String(count) }) };
}

async function failure(error: unknown, reservationId?: string): Promise<Response> {
  let refundPending = false;
  if (reservationId) {
    try { await refund(reservationId); }
    catch { refundPending = true; console.error("Falsify trial refund could not be confirmed", reservationId); }
  }
  const known = error instanceof DemoError || error instanceof RequestBodyError || error instanceof PublicUrlError;
  const code = known ? error.code : error instanceof ZodError ? "INVALID_RESPONSE_OR_INPUT" : "REVIEW_FAILED";
  const status = error instanceof DemoError || error instanceof RequestBodyError ? error.status : error instanceof PublicUrlError ? 422 : error instanceof ZodError ? 422 : 502;
  const message = refundPending ? "処理を完了できず、回数の返却も確認できませんでした。問い合わせ先にご連絡ください。 The request failed and the refund could not be confirmed."
    : known ? error.message : "処理を完了できませんでした。予約済みの利用回数があれば返却しました。 The request could not be completed.";
  return Response.json({ error: code, message }, { status, headers: { ...resultHeaders(), ...(status === 429 ? { "Retry-After": String(error instanceof DemoError ? error.retryAfter : 60) } : {}) } });
}

export async function demoStatus(request: Request): Promise<Response> {
  try {
    let visitor = readVisitor(request);
    let cookie: string | undefined;
    if (!visitor) {
      const created = createVisitor();
      visitor = created.visitor;
      cookie = created.cookie;
    }
    const ready = configured();
    const count = ready ? await remaining(visitor) : null;
    return Response.json({ enabled: true, ready, limit: TRIAL_LIMIT, remaining: count, period_days: TRIAL_DAYS, resets_at: new Date(visitor.expires).toISOString(), input_limit: INPUT_LIMIT, claim_limit: 2 }, { headers: { ...resultHeaders(count ?? undefined), ...(cookie ? { "Set-Cookie": cookie } : {}) } });
  } catch {
    return Response.json({ enabled: true, ready: false, limit: TRIAL_LIMIT, remaining: null, period_days: TRIAL_DAYS, input_limit: INPUT_LIMIT, claim_limit: 2 }, { headers: resultHeaders() });
  }
}

export async function analyzeDemo(request: Request): Promise<Response> {
  let reservationId: string | undefined;
  try {
    requireSameOrigin(request);
    const parsed = InputSchema.parse(await readJsonBody(request, 16 * 1024));
    if (parsed.type !== "url" && parsed.content.length > INPUT_LIMIT) throw new DemoError("TRIAL_INPUT_TOO_LONG", `無料体験では${INPUT_LIMIT}文字以内の抜粋を入力してください。 The preview accepts excerpts up to ${INPUT_LIMIT} characters.`, 422);
    const visitor = requireVisitor(request);
    const network = requestNetwork(request);
    const reserved = await reserve(visitor, network);
    reservationId = reserved.id;
    const input = await normalizeInput(parsed);
    if (input.content.length > INPUT_LIMIT) throw new DemoError("TRIAL_INPUT_TOO_LONG", `取得した文書が無料体験の${INPUT_LIMIT}文字上限を超えました。短い抜粋を貼り付けてください。 Paste a shorter excerpt.`, 422);
    const result = sealAnalysis(await reviewInput(input), visitor);
    return Response.json(result, { headers: resultHeaders(reserved.remaining) });
  } catch (error) { return failure(error, reservationId); }
}

export async function challengeDemo(request: Request): Promise<Response> {
  let reservationId: string | undefined;
  try {
    requireSameOrigin(request);
    const parsed = ChallengeRequest.parse(await readJsonBody(request, 512 * 1024));
    if (parsed.analysis.id === FLAGSHIP_DEMO_ID) {
      if (JSON.stringify(parsed.analysis) !== JSON.stringify(flagshipAnalysis) || !flagshipAnalysis.claims.some((claim) => claim.id === parsed.claim_id)) throw new DemoError("INVALID_DEMO", "保存済みデモの内容が一致しません。 The saved example has been modified.", 400);
      const burst = takeRateLimit(`prepared-demo:${getRequestClientKey(request)}`, 60, 60_000);
      if (!burst.allowed) throw new DemoError("RATE_LIMITED", "保存済みデモへの連続アクセスを少し空けてください。", 429, burst.retryAfterSeconds);
      return Response.json(await challengeFinding(parsed.analysis, parsed.claim_id), { headers: NO_STORE_HEADERS });
    }
    const visitor = requireVisitor(request);
    if (!validAnalysis(parsed.analysis, visitor)) throw new DemoError("INVALID_RECEIPT", "同じブラウザで過去24時間以内に作成した結果から再検証してください。 Re-check a recent, unmodified result from this browser.", 400);
    const claim = parsed.analysis.claims.find((item) => item.id === parsed.claim_id);
    const original = parsed.analysis.findings.find((item) => item.claim_id === parsed.claim_id);
    if (!claim || !original) throw new DemoError("INVALID_CLAIM", "対象の主張を確認できませんでした。", 400);
    const reserved = await reserve(visitor, requestNetwork(request));
    reservationId = reserved.id;
    const fresh = await reviewInput(parsed.analysis.input, [claim]);
    const revised = fresh.findings[0];
    const result = ChallengeResultSchema.parse({
      claim_id: claim.id,
      challenged_at: new Date().toISOString(),
      outcome: revised.verdict === "INSUFFICIENT_EVIDENCE" ? "unresolved" : revised.verdict !== original.verdict ? "changed" : "qualified",
      original_finding: original,
      revised_finding: revised,
      new_evidence: fresh.evidence,
      search_suggestions_html: [],
      explanation: "支持資料と反証資料を再度検索し、取得本文と照合しました。元の判断を独立に証明したわけではありません。The review was repeated using newly retrieved excerpts; inspect both versions and the original sources.",
    });
    return Response.json(result, { headers: resultHeaders(reserved.remaining) });
  } catch (error) { return failure(error, reservationId); }
}
