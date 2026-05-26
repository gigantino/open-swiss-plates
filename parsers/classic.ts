import * as cheerio from "cheerio";
import type { Listing, VehicleType } from "../types";
import { fetchHtml, parseAmount, parseInteger, type FetchOptions } from "./http";

// eCari platform. The listing is server-rendered into responsive table rows;
// each row is duplicated per breakpoint, so we read only the full-width tr.L.
// Cars and motorcycles live in separate tables on the same page.
export default async function classic(
  url: string,
  canton: string,
  opts?: FetchOptions,
): Promise<Listing[]> {
  const html = await fetchHtml(url, opts);
  const $ = cheerio.load(html);

  const listings: Listing[] = [];
  parseTable($, ".carContent", "car", canton, url, listings);
  parseTable($, ".bikeContent", "motorcycle", canton, url, listings);
  return listings;
}

function parseTable(
  $: cheerio.CheerioAPI,
  container: string,
  vehicleType: VehicleType,
  canton: string,
  source: string,
  out: Listing[],
): void {
  $(`${container} tbody tr.L`).each((_, el) => {
    const $row = $(el);
    const $number = $row.find(".plaqueAuto .number");
    if ($number.length === 0) return; // header or non-data row

    const plate = $number.text().trim();
    const id =
      $row.find("a[onclick*='openDetails']").attr("onclick")?.match(/openDetails\((\d+)\)/)?.[1] ?? "";

    const amounts = $row.find("td.amount");
    const $closing = $row.find(".closingTime");
    const endsAt = Date.parse($closing.text().trim().replace(/\//g, "-")) || null;

    out.push({
      canton,
      platform: "ecari",
      id,
      plate,
      plateNumber: parseInteger(plate),
      vehicleType,
      currentBid: parseAmount(amounts.eq(2).text()),
      startPrice: parseAmount(amounts.eq(0).text()),
      bidCount: parseInteger($closing.next().text()),
      lastBidder: $closing.next().next().text().trim() || null,
      endsAt,
      source,
    });
  });
}
