import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import {
  ClaimSchema,
  EVIDENCE_STANCES,
  EvidenceSchema,
  SOURCE_TYPES,
  type Claim,
  type Evidence,
  type Finding,
} from "@/lib/domain/schemas";
import { getLiveProvider } from "@/lib/ai/provider";
import {
  type GroundedSearchResult,
  searchGeminiGrounded,
} from "@/lib/gemini/generate";
import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai/client";

import {
  CHALLENGE_SEARCH_PROMPT,
  SUPPORT_SEARCH_PROMPT,
  UNTRUSTED_CONTENT_POLICY,
} from "./prompts";

const ModelEvidenceSchema = z
  .object({
    id: z.string(),
    claim_id: z.string(),
    stance: z.enum(EVIDENCE_STANCES),
    title: z.string(),
    url: z.string(),
    publisher: z.string().nullable(),
    published_at: z.string().nullable(),
    source_type: z.enum(SOURCE_TYPES),
    excerpt: z.string().nullable(),
    relevance: z.enum(["direct", "indirect", "context_only"]),
    directness: z.enum([
      "directly_supports",
      "partially_supports",
      "does_not_directly_support",
      "unclear",
    ]),
    notes: z.string().nullable(),
  })
  .strict();

const EvidenceSearchOutputSchema = z
  .object({
    evidence: z.array(ModelEvidenceSchema).max(24),
    unresolved_claim_ids: z.array(z.string()),
  })
  .strict();

interface CitationRecord {
  title: string;
  url: string;
}

export interface EvidenceRetrievalResult {
  supporting: Evidence[];
  challenging: Evidence[];
  limitations: string[];
  searchSuggestionsHtml: string[];
  mode: "live" | "sample";
}

interface ConfiguredEvidencePathResult {
  evidence: Evidence[];
  unresolved: string[];
  searchSuggestionHtml?: string | null;
}

async function settle<T>(
  task: () => Promise<T>,
): Promise<PromiseSettledResult<T>> {
  try {
    return { status: "fulfilled", value: await task() };
  } catch (reason) {
    return { status: "rejected", reason };
  }
}

export function safeProviderFailureReason(reason: unknown): string {
  const status =
    reason && typeof reason === "object" && "status" in reason
      ? Number((reason as { status?: unknown }).status)
      : null;
  const message = reason instanceof Error ? reason.message : "";

  if (
    status === 401 ||
    status === 403 ||
    /API_KEY_INVALID|API key not valid|PERMISSION_DENIED/i.test(message)
  ) {
    return "Gemini rejected the API key or project permission";
  }
  if (/grounding attribution was not returned/i.test(message)) {
    return "Gemini did not return the required Search Suggestions attribution";
  }
  if (status === 429 || /RESOURCE_EXHAUSTED|quota|rate.?limit/i.test(message)) {
    return "Gemini free-tier quota or rate limit was reached";
  }
  if (status === 404 || /model.+not found/i.test(message)) {
    return "the configured Gemini model was unavailable";
  }
  if (status === 400) {
    return "Gemini rejected the grounded-search request configuration";
  }
  if (status !== null && status >= 500) {
    return "the Gemini service was temporarily unavailable";
  }
  return "the Gemini request could not be completed";
}

function normalizeUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

export function extractCitationAllowlist(
  output: unknown,
): Map<string, CitationRecord> {
  const citations = new Map<string, CitationRecord>();

  function visit(value: unknown): void {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== "object") return;

    const item = value as Record<string, unknown>;
    if (
      item.type === "url_citation" &&
      typeof item.url === "string" &&
      typeof item.title === "string"
    ) {
      const normalized = normalizeUrl(item.url);
      if (normalized) {
        citations.set(normalized, { title: item.title, url: normalized });
      }
    }

    Object.values(item).forEach(visit);
  }

  visit(output);
  return citations;
}

export function filterEvidenceByCitations(
  candidates: z.infer<typeof ModelEvidenceSchema>[],
  citations: Map<string, CitationRecord>,
  claimIds: Set<string>,
  path: "support" | "challenge",
): Evidence[] {
  const allowedStances =
    path === "support"
      ? new Set(["supporting", "contextual"])
      : new Set(["contradicting", "qualifying", "contextual"]);
  const seen = new Set<string>();
  const output: Evidence[] = [];

  for (const candidate of candidates) {
    const url = normalizeUrl(candidate.url);
    const citation = url ? citations.get(url) : null;
    if (
      !url ||
      !citation ||
      !claimIds.has(candidate.claim_id) ||
      !allowedStances.has(candidate.stance) ||
      seen.has(`${candidate.claim_id}:${url}`)
    ) {
      continue;
    }

    const parsed = EvidenceSchema.safeParse({
      ...candidate,
      id: `${path}-evidence-${output.length + 1}`,
      title: citation.title,
      url: citation.url,
    });
    if (parsed.success) {
      seen.add(`${candidate.claim_id}:${url}`);
      output.push(parsed.data);
    }
  }

  return output;
}

async function runEvidencePath(
  claims: Claim[],
  path: "support" | "challenge",
): Promise<{ evidence: Evidence[]; unresolved: string[] }> {
  const client = getOpenAIClient();
  const response = await client.responses.parse({
    model: OPENAI_MODEL,
    max_output_tokens: 8_000,
    reasoning: { effort: "medium" },
    tools: [{ type: "web_search" }],
    input: [
      {
        role: "system",
        content: `${UNTRUSTED_CONTENT_POLICY}\n${
          path === "support" ? SUPPORT_SEARCH_PROMPT : CHALLENGE_SEARCH_PROMPT
        }`,
      },
      {
        role: "user",
        content: `<untrusted_claims>\n${JSON.stringify(claims)}\n</untrusted_claims>`,
      },
    ],
    text: {
      format: zodTextFormat(
        EvidenceSearchOutputSchema,
        `${path}_evidence_search`,
      ),
    },
  });

  if (!response.output_parsed) {
    return { evidence: [], unresolved: claims.map((claim) => claim.id) };
  }

  const citations = extractCitationAllowlist(response.output);
  const evidence = filterEvidenceByCitations(
    response.output_parsed.evidence,
    citations,
    new Set(claims.map((claim) => claim.id)),
    path,
  );

  return { evidence, unresolved: response.output_parsed.unresolved_claim_ids };
}

export function evidenceFromGeminiGrounding(
  search: GroundedSearchResult,
  claims: Claim[],
  path: "support" | "challenge",
): Evidence[] {
  const claimIds = new Set(claims.map((claim) => claim.id));
  const seen = new Set<string>();
  const perClaimCount = new Map<string, number>();
  const evidence: Evidence[] = [];

  for (const support of search.supports) {
    const explicitClaim = support.text
      .match(/\bclaim-\d+\b/i)?.[0]
      .toLowerCase();
    const claimId =
      explicitClaim && claimIds.has(explicitClaim)
        ? explicitClaim
        : claims.length === 1
          ? claims[0].id
          : null;
    if (!claimId) continue;

    for (const sourceIndex of support.sourceIndexes) {
      const source = search.sources[sourceIndex];
      if (
        !source ||
        seen.has(`${claimId}:${source.url}`) ||
        (perClaimCount.get(claimId) ?? 0) >= 4
      ) {
        continue;
      }
      const parsed = EvidenceSchema.safeParse({
        id: `${path}-evidence-${evidence.length + 1}`,
        claim_id: claimId,
        stance: path === "support" ? "supporting" : "qualifying",
        title: source.title,
        url: source.url,
        publisher: new URL(source.url).hostname,
        published_at: null,
        source_type: "other",
        excerpt: support.text
          .replace(/^\s*\[?claim-\d+\]?\s*[:—-]?\s*/i, "")
          .slice(0, 1_200),
        relevance: "indirect",
        directness:
          path === "support"
            ? "partially_supports"
            : "does_not_directly_support",
        notes:
          "Grounded model summary linked to this source by Gemini grounding metadata; it is not presented as a verified quotation.",
      });
      if (parsed.success) {
        seen.add(`${claimId}:${source.url}`);
        perClaimCount.set(claimId, (perClaimCount.get(claimId) ?? 0) + 1);
        evidence.push(parsed.data);
      }
    }
  }

  return evidence;
}

async function runGeminiEvidencePath(
  claims: Claim[],
  path: "support" | "challenge",
): Promise<ConfiguredEvidencePathResult> {
  const investigatorPrompt =
    path === "support" ? SUPPORT_SEARCH_PROMPT : CHALLENGE_SEARCH_PROMPT;
  const search = await searchGeminiGrounded(
    `<untrusted_claims>\n${JSON.stringify(claims)}\n</untrusted_claims>\n\nPrepare a concise evidence memo. Search independently for every claim and distinguish direct evidence from context. Every evidence-bearing sentence must begin with its exact claim ID in square brackets, for example [claim-1].`,
    `${UNTRUSTED_CONTENT_POLICY}\n${investigatorPrompt}\nEvery evidence-bearing sentence must begin with the exact supplied claim ID in square brackets. Keep each sentence focused on one claim so grounding metadata can be mapped conservatively.`,
  );
  const evidence = evidenceFromGeminiGrounding(search, claims, path);
  if (evidence.length && !search.searchSuggestionHtml) {
    throw new Error("Gemini grounding attribution was not returned.");
  }
  if (!evidence.length) {
    return {
      evidence: [],
      unresolved: claims.map((claim) => claim.id),
      searchSuggestionHtml: search.searchSuggestionHtml,
    };
  }

  return {
    evidence,
    unresolved: claims
      .filter((claim) => !evidence.some((item) => item.claim_id === claim.id))
      .map((claim) => claim.id),
    searchSuggestionHtml: search.searchSuggestionHtml,
  };
}

async function runConfiguredEvidencePath(
  claims: Claim[],
  path: "support" | "challenge",
): Promise<ConfiguredEvidencePathResult> {
  return getLiveProvider() === "gemini"
    ? runGeminiEvidencePath(claims, path)
    : runEvidencePath(claims, path);
}

export async function retrieveEvidence(
  claims: Claim[],
): Promise<EvidenceRetrievalResult> {
  if (!getLiveProvider()) {
    return {
      supporting: [],
      challenging: [],
      limitations: [
        "Live support and contradiction searches require a supported server-side model key. No sources were invented to fill this gap.",
      ],
      searchSuggestionsHtml: [],
      mode: "sample",
    };
  }

  let supportResult: PromiseSettledResult<ConfiguredEvidencePathResult>;
  let challengeResult: PromiseSettledResult<ConfiguredEvidencePathResult>;
  if (getLiveProvider() === "gemini") {
    supportResult = await settle(() =>
      runConfiguredEvidencePath(claims, "support"),
    );
    challengeResult = await settle(() =>
      runConfiguredEvidencePath(claims, "challenge"),
    );
  } else {
    [supportResult, challengeResult] = await Promise.allSettled([
      runConfiguredEvidencePath(claims, "support"),
      runConfiguredEvidencePath(claims, "challenge"),
    ]);
  }

  const support =
    supportResult.status === "fulfilled"
      ? supportResult.value
      : {
          evidence: [],
          unresolved: claims.map((claim) => claim.id),
          searchSuggestionHtml: null,
        };
  const challenge =
    challengeResult.status === "fulfilled"
      ? challengeResult.value
      : {
          evidence: [],
          unresolved: claims.map((claim) => claim.id),
          searchSuggestionHtml: null,
        };

  const limitations: string[] = [];
  if (supportResult.status === "rejected") {
    limitations.push(
      `The live support path was unavailable (${safeProviderFailureReason(supportResult.reason)}); no support source was invented.`,
    );
  }
  if (challengeResult.status === "rejected") {
    limitations.push(
      `The live challenge path was unavailable (${safeProviderFailureReason(challengeResult.reason)}); no counter-source was invented.`,
    );
  }
  if (support.unresolved.length) {
    limitations.push(
      `Support search reported unresolved claims: ${support.unresolved.join(", ")}.`,
    );
  }
  if (challenge.unresolved.length) {
    limitations.push(
      `Challenge search reported unresolved claims: ${challenge.unresolved.join(", ")}.`,
    );
  }
  if (!support.evidence.length) {
    limitations.push(
      "No support source survived the citation-provenance allowlist.",
    );
  }
  if (!challenge.evidence.length) {
    limitations.push(
      "No challenging source survived the citation-provenance allowlist.",
    );
  }

  return {
    supporting: support.evidence,
    challenging: challenge.evidence,
    limitations,
    searchSuggestionsHtml: [
      support.searchSuggestionHtml,
      challenge.searchSuggestionHtml,
    ].filter((item): item is string => Boolean(item)),
    mode:
      supportResult.status === "fulfilled" &&
      challengeResult.status === "fulfilled"
        ? "live"
        : "sample",
  };
}

export async function retrieveAdversarialRecheck(
  claim: Claim,
  finding: Finding,
): Promise<{
  evidence: Evidence[];
  limitations: string[];
  searchSuggestionsHtml: string[];
}> {
  if (!getLiveProvider()) {
    return {
      evidence: [],
      limitations: [
        "A live adversarial re-check requires a supported server-side model key.",
      ],
      searchSuggestionsHtml: [],
    };
  }

  const focusedClaim = ClaimSchema.parse({
    ...claim,
    evidence_requirements: [
      ...claim.evidence_requirements,
      "Actively seek evidence that weakens, qualifies, or overturns Falsify's initial finding: " +
        finding.analysis,
    ],
  });
  let result: ConfiguredEvidencePathResult;
  try {
    result = await runConfiguredEvidencePath([focusedClaim], "challenge");
  } catch {
    return {
      evidence: [],
      limitations: [
        "The live adversarial re-check was unavailable or rate-limited.",
      ],
      searchSuggestionsHtml: [],
    };
  }
  return {
    evidence: result.evidence.map((item, index) =>
      EvidenceSchema.parse({
        ...item,
        id: "recheck-evidence-" + (index + 1),
      }),
    ),
    limitations: result.unresolved.length
      ? ["The adversarial re-check reported unresolved evidence gaps."]
      : [],
    searchSuggestionsHtml: result.searchSuggestionHtml
      ? [result.searchSuggestionHtml]
      : [],
  };
}
