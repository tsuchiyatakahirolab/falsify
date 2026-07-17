import { lookup } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";

const MAX_URL_LENGTH = 2_048;
const MAX_REDIRECTS = 3;
export const MAX_SOURCE_BYTES = 1_000_000;

type ResolvedAddress = {
  address: string;
  family: 4 | 6;
};

type AddressResolver = (hostname: string) => Promise<ResolvedAddress[]>;

export type PublicTextResponse = {
  body: string;
  contentType: string;
  finalUrl: string;
  status: number;
};

export class PublicUrlError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "PublicUrlError";
  }
}

function normalizeHostname(hostname: string): string {
  return hostname.replace(/^\[|\]$/g, "").toLowerCase();
}

function isPublicIpv4(address: string): boolean {
  const octets = address.split(".").map(Number);
  if (
    octets.length !== 4 ||
    octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)
  ) {
    return false;
  }

  const [a, b] = octets;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && (b === 0 || b === 168)) return false;
  if (a === 198 && (b === 18 || b === 19 || b === 51)) return false;
  if (a === 203 && b === 0) return false;
  return true;
}

function parseIpv6Groups(address: string): number[] | null {
  let normalized = address.toLowerCase().split("%")[0];
  if (normalized.includes(".")) {
    const lastColon = normalized.lastIndexOf(":");
    const ipv4 = normalized.slice(lastColon + 1);
    if (!isPublicIpv4(ipv4) && isIP(ipv4) !== 4) return null;
    const octets = ipv4.split(".").map(Number);
    normalized = `${normalized.slice(0, lastColon)}:${((octets[0] << 8) | octets[1]).toString(16)}:${((octets[2] << 8) | octets[3]).toString(16)}`;
  }

  const halves = normalized.split("::");
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves[1] ? halves[1].split(":") : [];
  const missing = halves.length === 2 ? 8 - left.length - right.length : 0;
  const groups = [
    ...left,
    ...Array.from({ length: missing }, () => "0"),
    ...right,
  ];
  if (groups.length !== 8) return null;
  const parsed = groups.map((group) => Number.parseInt(group || "0", 16));
  return parsed.some(
    (group, index) =>
      !/^[0-9a-f]{1,4}$/.test(groups[index] || "0") ||
      !Number.isInteger(group) ||
      group < 0 ||
      group > 0xffff,
  )
    ? null
    : parsed;
}

function isPublicIpv6(address: string): boolean {
  const groups = parseIpv6Groups(address);
  if (!groups) return false;
  if (groups.every((group) => group === 0)) return false;
  if (groups.slice(0, 7).every((group) => group === 0) && groups[7] === 1) {
    return false;
  }
  if (
    groups.slice(0, 5).every((group) => group === 0) &&
    groups[5] === 0xffff
  ) {
    return false;
  }
  if (groups.slice(0, 6).every((group) => group === 0)) return false;
  if ((groups[0] & 0xfe00) === 0xfc00) return false;
  if ((groups[0] & 0xffc0) === 0xfe80) return false;
  if ((groups[0] & 0xff00) === 0xff00) return false;
  if (groups[0] === 0x2001 && groups[1] === 0x0db8) return false;
  return true;
}

export function isPublicIpAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return isPublicIpv4(address);
  if (family === 6) return isPublicIpv6(address);
  return false;
}

async function resolvePublicAddresses(
  hostname: string,
  resolver: AddressResolver = async (value) =>
    (await lookup(value, { all: true, verbatim: true }))
      .filter((item) => item.family === 4 || item.family === 6)
      .map((item) => ({
        address: item.address,
        family: item.family as 4 | 6,
      })),
): Promise<ResolvedAddress[]> {
  const normalized = normalizeHostname(hostname);
  const literalFamily = isIP(normalized);
  const addresses: ResolvedAddress[] =
    literalFamily === 4 || literalFamily === 6
      ? [{ address: normalized, family: literalFamily }]
      : await resolver(normalized);

  if (
    !addresses.length ||
    addresses.some(({ address }) => !isPublicIpAddress(address))
  ) {
    throw new PublicUrlError(
      "PRIVATE_NETWORK_BLOCKED",
      "The URL resolves to a private, local, or reserved network address.",
    );
  }
  return addresses;
}

export async function validatePublicUrl(
  rawUrl: string,
  resolver?: AddressResolver,
): Promise<{
  url: URL;
  addresses: ResolvedAddress[];
}> {
  if (rawUrl.length > MAX_URL_LENGTH) {
    throw new PublicUrlError("URL_TOO_LONG", "The submitted URL is too long.");
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new PublicUrlError("INVALID_URL", "The submitted URL is invalid.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new PublicUrlError(
      "UNSUPPORTED_PROTOCOL",
      "Only public HTTP and HTTPS URLs are supported.",
    );
  }
  if (url.username || url.password) {
    throw new PublicUrlError(
      "URL_CREDENTIALS_BLOCKED",
      "URLs containing credentials are not supported.",
    );
  }
  const expectedPort = url.protocol === "https:" ? "443" : "80";
  if (url.port && url.port !== expectedPort) {
    throw new PublicUrlError(
      "UNSUPPORTED_PORT",
      "Only standard HTTP and HTTPS ports are supported.",
    );
  }

  const hostname = normalizeHostname(url.hostname);
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw new PublicUrlError(
      "PRIVATE_NETWORK_BLOCKED",
      "Local and private network hostnames are not supported.",
    );
  }

  return { url, addresses: await resolvePublicAddresses(hostname, resolver) };
}

function requestOnce(
  url: URL,
  approved: ResolvedAddress,
): Promise<{
  body: string;
  contentType: string;
  location: string | null;
  status: number;
}> {
  return new Promise((resolve, reject) => {
    const finishResolve = (value: {
      body: string;
      contentType: string;
      location: string | null;
      status: number;
    }) => {
      if (totalTimeout) clearTimeout(totalTimeout);
      resolve(value);
    };
    const finishReject = (error: unknown) => {
      if (totalTimeout) clearTimeout(totalTimeout);
      reject(error);
    };
    const request = (url.protocol === "https:" ? httpsRequest : httpRequest)(
      url,
      {
        headers: {
          Accept: "text/html, text/plain, application/json",
          "Accept-Encoding": "identity",
          Connection: "close",
          "User-Agent": "FalsifyBot/0.1 (+public evidence verification)",
        },
        lookup: (_hostname, _options, callback) => {
          callback(null, approved.address, approved.family);
        },
      },
      (response) => {
        const status = response.statusCode ?? 0;
        if ([301, 302, 303, 307, 308].includes(status)) {
          response.resume();
          finishResolve({
            body: "",
            contentType: String(response.headers["content-type"] ?? ""),
            location: response.headers.location ?? null,
            status,
          });
          return;
        }
        const contentLength = Number(response.headers["content-length"] ?? 0);
        if (
          Number.isFinite(contentLength) &&
          contentLength > MAX_SOURCE_BYTES
        ) {
          response.resume();
          finishReject(
            new PublicUrlError(
              "SOURCE_TOO_LARGE",
              "The source response exceeds the one-megabyte download limit.",
            ),
          );
          return;
        }

        const chunks: Buffer[] = [];
        let received = 0;
        response.on("data", (chunk: Buffer) => {
          received += chunk.length;
          if (received > MAX_SOURCE_BYTES) {
            response.destroy(
              new PublicUrlError(
                "SOURCE_TOO_LARGE",
                "The source response exceeds the one-megabyte download limit.",
              ),
            );
            return;
          }
          chunks.push(chunk);
        });
        response.on("error", finishReject);
        response.on("end", () => {
          finishResolve({
            body: Buffer.concat(chunks).toString("utf8"),
            contentType: String(response.headers["content-type"] ?? ""),
            location: response.headers.location ?? null,
            status,
          });
        });
      },
    );

    request.setTimeout(10_000, () => {
      request.destroy(
        new PublicUrlError(
          "SOURCE_TIMEOUT",
          "The source did not respond within ten seconds.",
        ),
      );
    });
    const totalTimeout = setTimeout(() => {
      request.destroy(
        new PublicUrlError(
          "SOURCE_TIMEOUT",
          "The source did not complete within ten seconds.",
        ),
      );
    }, 10_000);
    request.on("error", (error) => {
      finishReject(
        error instanceof PublicUrlError
          ? error
          : new PublicUrlError(
              "SOURCE_UNAVAILABLE",
              "The public source could not be retrieved.",
            ),
      );
    });
    request.end();
  });
}

export async function fetchPublicText(
  rawUrl: string,
): Promise<PublicTextResponse> {
  let currentUrl = rawUrl;

  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const { url, addresses } = await validatePublicUrl(currentUrl);
    const response = await requestOnce(url, addresses[0]);
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      if (!response.location || redirects === MAX_REDIRECTS) {
        throw new PublicUrlError(
          "REDIRECT_BLOCKED",
          "The source exceeded the supported redirect limit.",
        );
      }
      currentUrl = new URL(response.location, url).toString();
      continue;
    }
    if (response.status < 200 || response.status >= 300) {
      throw new PublicUrlError(
        "SOURCE_HTTP_ERROR",
        `The source returned HTTP ${response.status}.`,
      );
    }
    return {
      body: response.body,
      contentType: response.contentType,
      finalUrl: url.toString(),
      status: response.status,
    };
  }

  throw new PublicUrlError(
    "REDIRECT_BLOCKED",
    "The source could not be retrieved.",
  );
}
