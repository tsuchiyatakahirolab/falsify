type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
};

const buckets = new Map<string, number[]>();
const MAX_BUCKETS = 2_000;
const OVERFLOW_BUCKET = "__overflow__";

export function getRequestClientKey(request: Request): string {
  const forwarded =
    request.headers.get("x-vercel-forwarded-for") ?? "anonymous";
  return forwarded.split(",")[0].trim().slice(0, 128) || "anonymous";
}

export function takeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  const cutoff = now - windowMs;
  let bucketKey = key;
  if (!buckets.has(bucketKey) && buckets.size >= MAX_BUCKETS - 1) {
    bucketKey = OVERFLOW_BUCKET;
  }
  const active = (buckets.get(bucketKey) ?? []).filter(
    (timestamp) => timestamp > cutoff,
  );
  if (active.length >= limit) {
    buckets.set(bucketKey, active);
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((active[0] + windowMs - now) / 1_000),
      ),
    };
  }

  active.push(now);
  buckets.set(bucketKey, active);
  if (buckets.size >= MAX_BUCKETS) {
    for (const [bucketKey, timestamps] of buckets) {
      if (!timestamps.some((timestamp) => timestamp > cutoff))
        buckets.delete(bucketKey);
    }
  }
  return {
    allowed: true,
    limit,
    remaining: limit - active.length,
    retryAfterSeconds: 0,
  };
}

export function resetRateLimitsForTests(): void {
  buckets.clear();
}

export function rateLimitBucketCountForTests(): number {
  return buckets.size;
}
