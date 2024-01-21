import puppeteer from "puppeteer";

type KybernaType = {
  id: number;
  canton: string;
  plateNumber: number;
  currentBid: number;
  totalBids: number;
  endsAt: number | null;
};

export type KybernaResponse = Promise<KybernaType[]>;

export default async function kyberna(url: string): KybernaResponse {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(url);

  const selector =
    "#body > div:nth-child(1) > div > div > div.main-content > div > div > div.auctions.text-center";

  await page.waitForSelector(selector);
  const elements = await page.$$(`${selector} > a`);

  const response: KybernaType[] = [];

  for (const elementHandle of elements) {
    const href = await elementHandle.evaluate((el) => el.getAttribute("href"));

    const idMatch = href.match(/\/auction\/(\d+)/);
    const id = idMatch ? parseInt(idMatch[1], 10) : 0;

    const titleText = await elementHandle.$eval(
      ".licence-plate-figcaption",
      (el) => el.textContent.trim(),
    );

    const titleMatch = titleText.match(/([A-Z]+)\s+(\d+)/);
    const canton = titleMatch ? titleMatch[1] : "";
    const plateNumber = titleMatch ? parseInt(titleMatch[2], 10) : 0;

    const currentBidText = await elementHandle.$eval(
      ".auction-current-bid",
      (el) => el.textContent.trim(),
    );

    const currentBid = parseFloat(currentBidText.replace(/[^\d.]/g, ""));

    const totalBidsText = await elementHandle.$eval(
      ".auction-number-bids",
      (el) => el.textContent.trim(),
    );
    const endsAtText = await elementHandle.$eval(
      ".auction-ends-at-text + div",
      (el) => el.textContent.trim(),
    );

    const totalBids = parseInt(totalBidsText, 10);

    const endsAtParse = Date.parse(endsAtText);
    const endsAt = isNaN(endsAtParse) ? null : endsAtParse;

    response.push({ id, canton, plateNumber, currentBid, totalBids, endsAt });
  }

  await browser.close();
  return response;
}
