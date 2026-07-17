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
import {
  getOpenAIClient,
  hasOpenAIKey,
  OPENAI_MODEL,
} from "@/lib/openai/client";

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
  mode: "live" | "sample";
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

export async function retrieveEvidence(
  claims: Claim[],
): Promise<EvidenceRetrievalResult> {
  if (!hasOpenAIKey()) {
    return {
      supporting: [],
      challenging: [],
      limitations: [
        "Live support and contradiction searches require a server-side OPENAI_API_KEY. No sources were invented to fill this gap.",
      ],
      mode: "sample",
    };
  }

  const [support, challenge] = await Promise.all([
    runEvidencePath(claims, "support"),
    runEvidencePath(claims, "challenge"),
  ]);

  const limitations: string[] = [];
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
    mode: "live",
  };
}

export async function retrieveAdversarialRecheck(
  claim: Claim,
  finding: Finding,
): Promise<{ evidence: Evidence[]; limitations: string[] }> {
  if (!hasOpenAIKey()) {
    return {
      evidence: [],
      limitations: [
        "A live adversarial re-check requires a server-side OPENAI_API_KEY.",
      ],
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
  const result = await runEvidencePath([focusedClaim], "challenge");
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
  };
}
