import { z, ZodError } from "zod";

import {
  challengeFinding,
  ChallengeInputError,
} from "@/lib/analysis/challenge";
import { AnalysisResultSchema } from "@/lib/domain/schemas";
import { getRequestClientKey, takeRateLimit } from "@/lib/security/rate-limit";
import {
  NO_STORE_HEADERS,
  readJsonBody,
  RequestBodyError,
} from "@/lib/security/request";

const ChallengeRequestSchema = z
  .object({
    analysis: AnalysisResultSchema,
    claim_id: z.string().min(1),
  })
  .strict();

export const runtime = "nodejs";
export const maxDuration = 60;

const CHALLENGE_BODY_LIMIT = 512 * 1_024;
const CHALLENGE_RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1_000;

export async function POST(request: Request): Promise<Response> {
  const rateLimit = takeRateLimit(
    `challenge:${getRequestClientKey(request)}`,
    CHALLENGE_RATE_LIMIT,
    RATE_WINDOW_MS,
  );
  const rateHeaders = {
    ...NO_STORE_HEADERS,
    "X-RateLimit-Limit": String(rateLimit.limit),
    "X-RateLimit-Remaining": String(rateLimit.remaining),
  };
  if (!rateLimit.allowed) {
    return Response.json(
      {
        error: "RATE_LIMITED",
        message:
          "The public demo re-check quota has been reached. Try again later.",
      },
      {
        status: 429,
        headers: {
          ...rateHeaders,
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  let parsed: z.infer<typeof ChallengeRequestSchema>;
  try {
    parsed = ChallengeRequestSchema.parse(
      await readJsonBody(request, CHALLENGE_BODY_LIMIT),
    );
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return Response.json(
        { error: error.code, message: error.message },
        { status: error.status, headers: rateHeaders },
      );
    }
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: "INVALID_CHALLENGE",
          message: "The challenge request did not match the supported format.",
        },
        { status: 400, headers: rateHeaders },
      );
    }
    return Response.json(
      {
        error: "CHALLENGE_INPUT_FAILED",
        message: "The challenge request could not be processed safely.",
      },
      { status: 500, headers: rateHeaders },
    );
  }

  try {
    return Response.json(
      await challengeFinding(parsed.analysis, parsed.claim_id),
      { headers: rateHeaders },
    );
  } catch (error) {
    if (error instanceof ChallengeInputError) {
      return Response.json(
        { error: "INVALID_CHALLENGE", message: error.message },
        { status: 400, headers: rateHeaders },
      );
    }
    return Response.json(
      {
        error: "CHALLENGE_FAILED",
        message:
          "The adversarial re-check could not be completed. Try again later.",
      },
      { status: 502, headers: rateHeaders },
    );
  }
}
