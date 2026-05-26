export type Platform = "kyberna" | "ecari" | "eschild";

export type SaleType = "auction" | "fixed-price" | "none";

export type VehicleType = "car" | "motorcycle" | "trailer" | null;

export interface Listing {
  canton: string;
  platform: Platform;
  id: string;
  /** Canonical plate label, "<canton> <number>", e.g. "TG 17231". */
  plate: string;
  plateNumber: number | null;
  vehicleType: VehicleType;
  currentBid: number | null;
  startPrice: number | null;
  bidCount: number | null;
  lastBidder: string | null;
  /** Listing end as epoch milliseconds, or null if unknown. */
  endsAt: number | null;
  source: string;
}

export interface CantonResult {
  canton: string;
  platform: Platform | null;
  saleType: SaleType;
  listings: Listing[];
  /** Set when the source threw or was unreachable. */
  error?: string;
  /** Set when the canton intentionally produces no listings. */
  note?: string;
}

export interface SourceStatus {
  canton: string;
  platform: Platform | null;
  saleType: SaleType;
  count: number;
  error?: string;
  note?: string;
}

export interface ScrapeReport {
  fetchedAt: string;
  listings: Listing[];
  sources: SourceStatus[];
}
