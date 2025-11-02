// Distinguish between supported asset types
export type AssetType = 'stock' | 'crypto';

// Summary used in search/autocomplete results
export interface AssetSummary {
  symbol: string;
  name: string;
  type: AssetType;
  region?: string;
  currency?: string;
  matchScore?: number;
}

// Represents detailed information for a selected asset
export interface AssetDetail {
  symbol: string;
  name: string;
  type: AssetType;
  currentPrice: number;
  marketCap?: number | null;
  currency?: string;
  meta?: AssetMetaData;          // store metadata info
  history?: HistoricalPrice[];   // now uses full OHLC instead of just close
}

// Represents Alpha Vantage "Meta Data" section
export interface AssetMetaData {
  information?: string;    // "Daily Prices (open, high, low, close) and Volumes"
  symbol?: string;         // "IBM"
  lastRefreshed?: string;  // "2025-10-31"
  outputSize?: string;     // "Compact" | "Full"
  timeZone?: string;       // "US/Eastern"
}

// Represents a single daily (or intraday) price record (OHLC)
export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
