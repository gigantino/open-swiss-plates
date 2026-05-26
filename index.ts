import { CANTONS, type CantonConfig } from "./registry";
import type { Listing, CantonResult, Platform, ScrapeReport } from "./types";
import kyberna from "./parsers/kyberna";
import classic from "./parsers/classic";
import ricardo from "./parsers/ricardo";
import eschild from "./parsers/eschild";

type Parser = (url: string, canton: string, opts?: { insecureTLS?: boolean }) => Promise<Listing[]>;

const PARSERS: Record<Platform, Parser> = {
  kyberna,
  ecari: classic,
  ricardo,
  eschild,
};

async function runCanton(config: CantonConfig): Promise<CantonResult> {
  const { canton, saleType, platform, url, note, insecureTLS } = config;

  if (!platform || !url) {
    return { canton, platform: platform ?? null, saleType, listings: [], note };
  }

  try {
    const listings = (await PARSERS[platform](url, canton, { insecureTLS })).map(canonicalize);
    return { canton, platform, saleType, listings };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return { canton, platform, saleType, listings: [], error };
  }
}

// Each platform labels plates differently (bare number, marketing title, ...),
// so derive a uniform "<canton> <number>" label wherever we have the number.
function canonicalize(listing: Listing): Listing {
  if (listing.plateNumber == null) return listing;
  return { ...listing, plate: `${listing.canton} ${listing.plateNumber}` };
}

export function scrapeAll(): Promise<CantonResult[]> {
  return Promise.all(CANTONS.map(runCanton));
}

// Flat listings plus a per-canton status, so failures and freshness survive
// serialization (the flat array alone hides both).
export function toReport(results: CantonResult[]): ScrapeReport {
  return {
    fetchedAt: new Date().toISOString(),
    listings: results.flatMap((r) => r.listings),
    sources: results.map((r) => ({
      canton: r.canton,
      platform: r.platform,
      saleType: r.saleType,
      count: r.listings.length,
      ...(r.error ? { error: r.error } : {}),
      ...(r.note ? { note: r.note } : {}),
    })),
  };
}

function printSummary(results: CantonResult[]): void {
  for (const r of results) {
    const status = r.error
      ? `ERROR: ${r.error}`
      : r.platform
        ? `${r.listings.length} listings`
        : (r.note ?? r.saleType);
    console.error(`  ${r.canton}  ${(r.platform ?? "").padEnd(8)}  ${status}`);
  }

  const total = results.reduce((sum, r) => sum + r.listings.length, 0);
  const scraped = results.filter((r) => r.platform && !r.error).length;
  console.error(`\n${total} listings from ${scraped}/${results.length} cantons`);
}

if (import.meta.main) {
  const results = await scrapeAll();
  printSummary(results);
  console.log(JSON.stringify(toReport(results), null, 2));
}
