import type { Platform, SaleType } from "./types";

export interface CantonConfig {
  canton: string;
  saleType: SaleType;
  platform?: Platform;
  url?: string;
  note?: string;
  /** Skip TLS verification for hosts that serve an incomplete cert chain. */
  insecureTLS?: boolean;
}

// Cantons grouped by the platform their road-traffic office uses. A canton
// without a platform has no online source we can read.
export const CANTONS: CantonConfig[] = [
  { canton: "VD", saleType: "auction", platform: "kyberna", url: "https://www.encheres-vd.ch/en" },
  { canton: "AG", saleType: "auction", platform: "kyberna", url: "https://www.auktion-ag.ch/en/" },
  { canton: "ZH", saleType: "auction", platform: "kyberna", url: "https://www.auktion.stva.zh.ch/en/" },
  { canton: "BE", saleType: "auction", platform: "kyberna", url: "https://www.auktion-be.ch/en/" },
  { canton: "TG", saleType: "auction", platform: "kyberna", url: "https://www.auktion.tg.ch/en/" },
  { canton: "SH", saleType: "auction", platform: "kyberna", url: "https://www.auktion-stva.sh.ch/de/" },

  { canton: "AR", saleType: "auction", platform: "ecari", url: "https://eauktion.ar.ch/ecari-auction/ui/app/init?locale=de_ch" },
  { canton: "BL", saleType: "auction", platform: "ecari", url: "https://eauktion.bl.ch/ecari-auction/ui/app/init?locale=de_ch" },
  { canton: "FR", saleType: "auction", platform: "ecari", url: "https://appls.ocn.ch/ecari-auction/ui/app/init?locale=de_ch", insecureTLS: true },
  { canton: "GR", saleType: "auction", platform: "ecari", url: "https://eauktion.gr.ch/ecari-auction/ui/app/init?locale=it_ch" },
  { canton: "NW", saleType: "auction", platform: "ecari", url: "https://ecarinwprod.ilz.info/ecari-auction/ui/app/init?locale=de_ch" },
  { canton: "OW", saleType: "auction", platform: "ecari", url: "https://ecariowprod.ilz.info/ecari-auction/ui/app/init?locale=de_ch" },
  { canton: "SG", saleType: "auction", platform: "ecari", url: "https://egov.stva.sg.ch/ecari-auction/ui/app/init?locale=de_ch" },
  { canton: "SO", saleType: "auction", platform: "ecari", url: "https://eauktion.so.ch/ecari-auction/ui/app/init?locale=de_ch" },
  { canton: "SZ", saleType: "auction", platform: "ecari", url: "https://cariegov.sz.ch/ecari-auction/ui/app/init?locale=de_ch" },
  { canton: "VS", saleType: "auction", platform: "ecari", url: "https://ecari.vs.ch/ecari-auction/ui/app/init?locale=de_ch" },
  { canton: "TI", saleType: "auction", platform: "ecari", url: "https://www.carieauktion.ti.ch/ecari-auktion/ui/app/init?locale=it_ch" },

  { canton: "GE", saleType: "auction", platform: "ricardo", url: "https://www.ricardo.ch/de/shop/encheres-plaques-ge/offers/" },
  { canton: "JU", saleType: "auction", platform: "ricardo", url: "https://www.ricardo.ch/fr/shop/OVJ/offers/" },
  { canton: "NE", saleType: "auction", platform: "ricardo", url: "https://www.ricardo.ch/de/shop/encheres-plaques-ne/offers/" },

  { canton: "GL", saleType: "fixed-price", platform: "eschild", url: "https://eschild.gl.ch/" },

  { canton: "AI", saleType: "fixed-price", note: "Sales list at the road-traffic office, no online source." },
  { canton: "BS", saleType: "fixed-price", note: "Sales list at the road-traffic office, no online source." },
  { canton: "LU", saleType: "fixed-price", note: "Sales list at the road-traffic office, no online source." },
  { canton: "UR", saleType: "fixed-price", note: "Sales list at the road-traffic office, no online source." },

  { canton: "ZG", saleType: "none", note: "Online auction provisioned but not yet live." },
];
