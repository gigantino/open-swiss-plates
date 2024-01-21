/*
import kyberna from "./parsers/kyberna";
import type { KybernaResponse } from "./parsers/kyberna";

const kybernaSites = [
  "https://www.encheres-vd.ch/en",
  "https://www.auktion-ag.ch/en/",
  "https://www.auktion.stva.zh.ch/en/",
  "https://www.auktion-be.ch/en/",
  "https://www.auktion.tg.ch/en/",
];

const kybernaRequests: KybernaResponse[] = [];

kybernaSites.forEach((url) => kybernaRequests.push(kyberna(url)));

const kybernaResponse = await Promise.all(kybernaRequests);

console.log(kybernaResponse.flat(1));
*/

import puppeteer from "puppeteer";

interface AuctionItem {
  numberOfOffers: number;
  bidderName: string;
}

async function scrape() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto("https://ecari.vs.ch/ecari-auction/");

  const selector = "#tabContent1 > div > div > div.carContent > table > tbody";

  await page.waitForSelector(selector);

  const elements = await page.$$(selector + " > tr");

  const auctionItems: AuctionItem[] = [];

  for (const elementHandle of elements) {
    const tdValues = await page.evaluate((tr) => {
      const tds = tr.querySelectorAll("td");
      return tds ? Array.from(tds).map((td) => td.textContent.trim()) : null;
    }, elementHandle);

    tdValues?.forEach((v, i) => {
      console.log(i, v);
    });
  }

  await browser.close();
}

scrape();
