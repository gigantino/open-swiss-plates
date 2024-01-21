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
