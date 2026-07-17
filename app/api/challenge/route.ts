import { z } from "zod";

import { challengeFinding } from "@/lib/analysis/challenge";
import { AnalysisResultSchema } from "@/lib/domain/schemas";

const ChallengeRequestSchema = z
  .object({
    analysis: AnalysisResultSchema,
    claim_id: z.string().min(1),
  })
  .strict();

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  try {
    const parsed = ChallengeRequestSchema.parse(await request.json());
    return Response.json(
      await challengeFinding(parsed.analysis, parsed.claim_id),
    );
  } catch (error) {
    return Response.json(
      {
        error: "CHALLENGE_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "The adversarial re-check failed unexpectedly.",
      },
      { status: 400 },
    );
  }
}
