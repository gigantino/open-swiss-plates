import * as cheerio from "cheerio";
import type { Listing, VehicleType } from "../types";
import { fetchHtml, parseAmount, parseInteger, type FetchOptions } from "./http";

// ky2help auction sites. The grid is server-rendered, so a plain fetch works.
// Cars and motorcycles share the same grid and are told apart by the row icon.
export default async function kyberna(
  url: string,
  canton: string,
  opts?: FetchOptions,
): Promise<Listing[]> {
  const html = await fetchHtml(url, opts);
  const $ = cheerio.load(html);
  const listings: Listing[] = [];

  $(".auctions a[href*='/auction/']").each((_, el) => {
    const $el = $(el);

    const id = $el.attr("href")?.match(/\/auction\/(\d+)/)?.[1] ?? "";
    const plate = $el.find(".licence-plate-figcaption").text().trim();
    const plateNumber = parseInteger(plate.match(/\d[\d'\s]*$/)?.[0] ?? null);

    const icon = $el.find(".plate-type-icon").attr("src") ?? "";
    const vehicleType = vehicleTypeFromIcon(icon);

    const endsAtText = $el.find(".auction-ends-at-text").next().text().trim();
    const endsAt = Date.parse(endsAtText) || null;

    listings.push({
      canton,
      platform: "kyberna",
      id,
      plate,
      plateNumber,
      vehicleType,
      currentBid: parseAmount($el.find(".auction-current-bid").text()),
      startPrice: null,
      bidCount: parseInteger($el.find(".auction-number-bids").text()),
      lastBidder: null,
      endsAt,
      source: url,
    });
  });

  return listings;
}

function vehicleTypeFromIcon(src: string): VehicleType {
  if (src.includes("motorcycle")) return "motorcycle";
  if (src.includes("trailer")) return "trailer";
  if (src.includes("car")) return "car";
  return null;
}
