export type AssetType = 'stock' | 'crypto';

export interface AssetSummary {
  symbol: string;
  name: string;
  type: AssetType;
  region?: string;
  currency?: string;
  matchScore?: number;
}

export interface AssetDetail {
  symbol: string;
  name: string;
  type: AssetType;
  currentPrice: number;
  marketCap?: number | null;
  currency?: string;
  lastUpdated?: string;
  history?: { date: string; close: number }[];
}