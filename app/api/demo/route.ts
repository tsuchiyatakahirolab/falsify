import { flagshipAnalysis } from "@/lib/demo/flagship";
import { NO_STORE_HEADERS } from "@/lib/security/request";

export async function GET(): Promise<Response> {
  return Response.json(flagshipAnalysis, { headers: NO_STORE_HEADERS });
}
