import { demoStatus } from "@/lib/free-demo/http";
import { publicDemoEnabled } from "@/lib/free-demo/access";
import { NO_STORE_HEADERS } from "@/lib/security/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  if (!publicDemoEnabled()) return Response.json({ enabled: false }, { headers: NO_STORE_HEADERS });
  return demoStatus(request);
}
