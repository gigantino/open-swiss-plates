# open-swiss-plates

Collects live license plate listings from Swiss cantonal road-traffic offices
into a single JSON feed. Each canton runs its own platform, so cantons are
grouped by the platform they use.

## Usage

```bash
bun install
bun start
```

`bun start` writes a JSON report to stdout and a per-canton summary to stderr,
so you can pipe the data:

```bash
bun start 2>/dev/null > report.json
```

The report has the fetch time, the flat list of listings, and a per-canton
status so failed or empty sources stay visible:

```json
{
  "fetchedAt": "2026-05-26T12:00:00.000Z",
  "listings": [ /* Listing[] */ ],
  "sources": [ { "canton": "GE", "platform": "ricardo", "saleType": "auction", "count": 0, "error": "..." } ]
}
```

You can also call it directly:

```ts
import { scrapeAll, toReport } from "./index";

const results = await scrapeAll(); // one CantonResult per canton
const report = toReport(results);
```

See `types.ts` for the `Listing` and `ScrapeReport` shapes.

## Layout

- `registry.ts` lists every canton with its platform and URL.
- `parsers/` has one module per platform, each returning `Listing[]`.
- `index.ts` runs the parsers and aggregates the results.

## Coverage

| Platform | Cantons |
| --- | --- |
| kyberna | VD, AG, ZH, BE, TG, SH |
| ecari | AR, BL, FR, GR, NW, OW, SG, SO, SZ, VS, TI |
| ricardo | GE, JU, NE |
| eschild | GL |

The kyberna and ecari listings are server-rendered, so those parsers fetch HTML.
ricardo is behind Cloudflare and eschild is WAF-protected, so both drive a
headless browser through puppeteer.

AI, BS, LU and UR sell from offline lists with no online source. ZG has a
platform set up but it is not live yet.

## License

MIT
