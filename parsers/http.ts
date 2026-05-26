// Some cantonal sites reject the default fetch User-Agent.
export const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export interface FetchOptions {
  timeoutMs?: number;
  // Only for hosts serving a broken cert chain. Set per-host in the registry.
  insecureTLS?: boolean;
}

export async function fetchHtml(url: string, opts: FetchOptions = {}): Promise<string> {
  const { timeoutMs = 30_000, insecureTLS = false } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      tls: insecureTLS ? { rejectUnauthorized: false } : undefined,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en,de;q=0.9,fr;q=0.8,it;q=0.7",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

// Parse a CHF amount like "CHF 1'250.50" or "14500" into a number, or null.
export function parseAmount(text: string | null | undefined): number | null {
  if (!text) return null;
  const cleaned = text.replace(/[^\d.]/g, "");
  if (cleaned === "") return null;
  const value = parseFloat(cleaned);
  return Number.isNaN(value) ? null : value;
}

// Parse the first run of digits in a string into an integer, or null.
export function parseInteger(text: string | null | undefined): number | null {
  if (!text) return null;
  const match = text.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}
