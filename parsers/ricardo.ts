import puppeteer, { type Browser } from "puppeteer";
import type { Listing, VehicleType } from "../types";
import { USER_AGENT, parseAmount, parseInteger, type FetchOptions } from "./http";

// Month names (fr, de, it) to 1-based month, for parsing end dates.
const MONTHS: Record<string, number> = {
  jan: 1, fév: 2, fev: 2, feb: 2, mar: 3, mär: 3, avr: 4, apr: 4, mai: 5, mag: 5,
  jui: 6, jun: 6, giu: 6, jul: 7, lug: 7, aoû: 8, aou: 8, aug: 8, ago: 8,
  sep: 9, set: 9, oct: 10, okt: 10, ott: 10, nov: 11, déc: 12, dec: 12, dez: 12, dic: 12,
};

interface RicardoCard {
  href: string;
  text: string;
}

// ricardo.ch sits behind Cloudflare and renders client-side, so this parser
// drives a real headless browser instead of a plain fetch. Cloudflare still
// blocks intermittently, so navigation is retried before giving up.
export default async function ricardo(
  url: string,
  canton: string,
  _opts?: FetchOptions,
): Promise<Listing[]> {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const cards = await loadCards(browser, url);
    return cards.map((card) => toListing(card, canton, url));
  } finally {
    await browser.close();
  }
}

async function loadCards(browser: Browser, url: string, attempts = 3): Promise<RicardoCard[]> {
  let lastError = "";
  for (let attempt = 0; attempt < attempts; attempt++) {
    const page = await browser.newPage();
    try {
      await page.setUserAgent(USER_AGENT);
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60_000 });

      if ((await page.title()) === "Forbidden") {
        lastError = "blocked by Cloudflare (HTTP 403)";
        continue;
      }

      // Offers hydrate after load and lazy-render on scroll.
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise((r) => setTimeout(r, 2_500));

      return await page.evaluate(() => {
        const seen = new Set<string>();
        const out: { href: string; text: string }[] = [];
        for (const a of document.querySelectorAll<HTMLAnchorElement>("a[href*='/a/']")) {
          const href = a.getAttribute("href");
          if (!href || seen.has(href)) continue;
          seen.add(href);
          out.push({ href, text: a.innerText.replace(/\n+/g, " | ") });
        }
        return out;
      });
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    } finally {
      await page.close();
    }
  }
  throw new Error(`ricardo: ${lastError || "no offers found"}`);
}

// Card text looks like "<title> | <price> | (<n> bids) | <end>".
function toListing(card: RicardoCard, canton: string, source: string): Listing {
  const parts = card.text.split("|").map((p) => p.trim());
  const title = parts[0] ?? "";

  return {
    canton,
    platform: "ricardo",
    id: card.href.match(/-(\d+)\/?$/)?.[1] ?? "",
    plate: title,
    plateNumber: parseInteger(title.match(new RegExp(`${canton}\\s*(\\d+)`))?.[1] ?? null),
    vehicleType: vehicleTypeOf(title),
    currentBid: parseAmount(parts[1]),
    startPrice: null,
    bidCount: parseInteger(parts[2]),
    lastBidder: null,
    endsAt: parseEndDate(parts[3] ?? ""),
    source,
  };
}

function vehicleTypeOf(title: string): VehicleType {
  if (/\bmoto/i.test(title)) return "motorcycle";
  if (/remorque|anh[äa]nger|rimorchio|trailer/i.test(title)) return "trailer";
  if (/\b(auto|voiture|vettura)/i.test(title)) return "car";
  return null;
}

// Parse a localized end date like "Jeu 28 mai, 13:50" into epoch ms. The year
// is not shown, so assume the current one. "Beendet"/"Terminé" means ended.
function parseEndDate(text: string): number | null {
  const match = text.match(/(\d{1,2})\.?\s+([A-Za-zéûäöü]{3})[a-zéûäöü]*,?\s+(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const [, day, name, hour, minute] = match;
  const month = MONTHS[name.toLowerCase().slice(0, 3)];
  if (!month) return null;
  return new Date(new Date().getFullYear(), month - 1, +day, +hour, +minute).getTime();
}
