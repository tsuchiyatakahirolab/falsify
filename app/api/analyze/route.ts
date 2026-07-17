import { ZodError } from "zod";

import { analyzeInput } from "@/lib/analysis/orchestrate";
import { normalizeInput } from "@/lib/input/normalize";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  try {
    const body: unknown = await request.json();
    const input = await normalizeInput(body);
    const result = await analyzeInput(input);
    return Response.json(result);
  } catch (error) {
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
        { status: 400 },
      );
    }
    const message =
      error instanceof Error ? error.message : "Analysis failed unexpectedly.";
    return Response.json(
      {
        error: "ANALYSIS_FAILED",
        message,
      },
      { status: 500 },
    );
  }
}
