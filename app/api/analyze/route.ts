import { ZodError } from "zod";

import { analyzeInput } from "@/lib/analysis/orchestrate";
import { normalizeInput } from "@/lib/input/normalize";
import { PublicUrlError } from "@/lib/security/public-url";
import { getRequestClientKey, takeRateLimit } from "@/lib/security/rate-limit";
import {
  NO_STORE_HEADERS,
  readJsonBody,
  RequestBodyError,
} from "@/lib/security/request";

export const runtime = "nodejs";
export const maxDuration = 60;

const ANALYSIS_BODY_LIMIT = 64 * 1_024;
const ANALYSIS_RATE_LIMIT = 8;
const RATE_WINDOW_MS = 60 * 60 * 1_000;

export async function POST(request: Request): Promise<Response> {
  const rateLimit = takeRateLimit(
    `analysis:${getRequestClientKey(request)}`,
    ANALYSIS_RATE_LIMIT,
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
          "The public demo analysis quota has been reached. Try again later.",
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

  let input;
  try {
    input = await normalizeInput(
      await readJsonBody(request, ANALYSIS_BODY_LIMIT),
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
          error: "INVALID_INPUT",
          message: "The submitted input did not match the supported format.",
          details: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400, headers: rateHeaders },
      );
    }
    if (error instanceof PublicUrlError) {
      return Response.json(
        { error: error.code, message: error.message },
        { status: 422, headers: rateHeaders },
      );
    }
    return Response.json(
      {
        error: "INPUT_PROCESSING_FAILED",
        message: "The submitted source could not be processed safely.",
      },
      { status: 500, headers: rateHeaders },
    );
  }

  try {
    return Response.json(await analyzeInput(input), { headers: rateHeaders });
  } catch {
    return Response.json(
      {
        error: "ANALYSIS_FAILED",
        message:
          "The analysis service could not complete this request. Try again later.",
      },
      { status: 502, headers: rateHeaders },
    );
  }
}
