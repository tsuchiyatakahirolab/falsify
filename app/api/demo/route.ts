import { flagshipAnalysis } from "@/lib/demo/flagship";

export async function GET(): Promise<Response> {
  return Response.json(flagshipAnalysis);
}
