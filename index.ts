import puppeteer from "puppeteer";

async function scrapePage() {
  const browser = await puppeteer.launch({ headless: "new" });

  const page = await browser.newPage();

  // await page.goto("https://www.encheres-vd.ch/en/");
  await page.goto("https://www.auktion.stva.zh.ch/en");

  await page.waitForSelector(
    "#body > div:nth-child(1) > div > div > div.main-content > div > div > div.auctions.text-center",
  );

  const elements = await page.$$(
    "#body > div:nth-child(1) > div > div > div.main-content > div > div > div.auctions.text-center > a",
  );

  const data: {
    id: number;
    canton: string;
    number: number;
    currentBid: number;
    numBids: number;
    endsAt: number;
  }[] = [];

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
    const number = titleMatch ? parseInt(titleMatch[2], 10) : 0;

    const currentBidText = await elementHandle.$eval(
      ".auction-current-bid",
      (el) => el.textContent.trim(),
    );

    const currentBid = parseFloat(currentBidText.replace(/[^\d.]/g, ""));

    const numBidsText = await elementHandle.$eval(
      ".auction-number-bids",
      (el) => el.textContent.trim(),
    );
    const endsAtText = await elementHandle.$eval(
      ".auction-ends-at-text + div",
      (el) => el.textContent.trim(),
    );

    const numBids = parseInt(numBidsText, 10);

    const endsAt = Date.parse(endsAtText);

    data.push({ id, canton, number, currentBid, numBids, endsAt });
  }

  await browser.close();

  console.log("Extracted data:", data);
}

// Run the function
scrapePage();
