import puppeteer from "puppeteer";
import type { Listing, VehicleType } from "../types";
import { USER_AGENT, type FetchOptions } from "./http";

interface EschildPlate {
  id: number;
  number: number;
  price: number;
  available: number;
  deleted: number;
  platetype: string;
}

// Glarus "eSchild". The catalogue comes from /api/v1/plate, which is
// WAF-protected, so we read it from inside a real browser session.
export default async function eschild(
  url: string,
  canton: string,
  _opts?: FetchOptions,
): Promise<Listing[]> {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60_000 });

    const plates = await page.evaluate(async () => {
      const res = await fetch("/api/v1/plate");
      if (!res.ok) throw new Error(`api HTTP ${res.status}`);
      const body = (await res.json()) as { data?: unknown };
      return (Array.isArray(body.data) ? body.data : []) as EschildPlate[];
    });

    return plates
      .filter((p) => p.available === 1 && p.deleted === 0)
      .map((p): Listing => ({
        canton,
        platform: "eschild",
        id: String(p.id),
        plate: `${canton} ${p.number}`,
        plateNumber: typeof p.number === "number" ? p.number : null,
        vehicleType: vehicleTypeOf(p.platetype),
        currentBid: null,
        startPrice: typeof p.price === "number" ? p.price : null,
        bidCount: null,
        lastBidder: null,
        endsAt: null,
        source: url,
      }));
  } catch (err) {
    throw new Error(`eschild: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    await browser.close();
  }
}

function vehicleTypeOf(platetype: string | undefined): VehicleType {
  if (!platetype) return null;
  if (/moto|bike/i.test(platetype)) return "motorcycle";
  if (/trailer|anh[äa]nger/i.test(platetype)) return "trailer";
  return "car";
}
