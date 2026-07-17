import { InputSchema, type FalsifyInput } from "@/lib/domain/schemas";

const MAX_INPUT_CHARS = 30_000;

function decodeHtml(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

export function extractReadableText(html: string): string {
  return decodeHtml(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

async function normalizeUrlInput(input: FalsifyInput): Promise<FalsifyInput> {
  const url = input.source_url;
  if (!url) throw new Error("URL input is missing a source URL.");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "FalsifyBot/0.1 (+public evidence verification)",
      Accept: "text/html, text/plain, application/json",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`The source returned HTTP ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (
    !contentType.includes("text/html") &&
    !contentType.includes("text/plain") &&
    !contentType.includes("application/json")
  ) {
    throw new Error("This URL does not expose a supported text response.");
  }
  const raw = await response.text();
  const content = contentType.includes("text/html")
    ? extractReadableText(raw)
    : raw.trim();
  if (!content) throw new Error("No readable text was found at this URL.");

  return InputSchema.parse({
    ...input,
    content: content.slice(0, MAX_INPUT_CHARS),
    title: input.title ?? new URL(url).hostname,
  });
}

export async function normalizeInput(input: unknown): Promise<FalsifyInput> {
  const parsed = InputSchema.parse(input);
  if (parsed.type === "url") return normalizeUrlInput(parsed);
  return { ...parsed, content: parsed.content.slice(0, MAX_INPUT_CHARS) };
}
