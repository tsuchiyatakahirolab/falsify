export const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
} as const;

export class RequestBodyError extends Error {
  constructor(
    public readonly code: "INVALID_JSON" | "REQUEST_TOO_LARGE",
    public readonly status: 400 | 413,
    message: string,
  ) {
    super(message);
    this.name = "RequestBodyError";
  }
}

export async function readJsonBody(
  request: Request,
  maxBytes: number,
): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new RequestBodyError(
      "REQUEST_TOO_LARGE",
      413,
      "The request body exceeds the supported size limit.",
    );
  }

  if (!request.body) {
    throw new RequestBodyError(
      "INVALID_JSON",
      400,
      "A JSON request body is required.",
    );
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new RequestBodyError(
        "REQUEST_TOO_LARGE",
        413,
        "The request body exceeds the supported size limit.",
      );
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } catch {
    throw new RequestBodyError(
      "INVALID_JSON",
      400,
      "The request body is not valid JSON.",
    );
  }
}
