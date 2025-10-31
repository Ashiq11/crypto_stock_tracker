import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { AssetSummary, AssetDetail } from '../models/asset.model';

@Injectable({ providedIn: 'root' })
export class MarketService {
  private base = environment.alphaVantageBaseUrl;
  private key = environment.alphaVantageApiKey;
  private cache = new Map<string, Observable<any>>();

  constructor(private http: HttpClient) { }

  /** Search symbols using SYMBOL_SEARCH */
  searchSymbols(query: string): Observable<AssetSummary[]> {
    if (!query || query.trim().length === 0) return of([]);

    const params = new HttpParams()
      .set('function', 'SYMBOL_SEARCH')
      .set('keywords', query)
      .set('apikey', this.key);

    const cacheKey = `search:${query.toLowerCase()}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

    const obs = this.http.get<any>(this.base, { params }).pipe(
      map(res => {
        const best = res?.bestMatches || [];
        return best.map((m: any) => ({
          symbol: m['1. symbol'],
          name: m['2. name'],
          type: 'stock' as const,
          region: m['4. region'],
          currency: m['8. currency'] || 'USD',
          matchScore: parseFloat(m['9. matchScore'] || '0')
        }) as AssetSummary);
      }),
      catchError(err => {
        console.error('searchSymbols error', err);
        return throwError(() => new Error('Failed to search symbols'));
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.cache.set(cacheKey, obs);
    return obs;
  }

  /** TIME_SERIES_DAILY_ADJUSTED for stocks */
  getStockDaily(symbol: string): Observable<{ date: string; close: number }[]> {
    const params = new HttpParams()
      .set('function', 'TIME_SERIES_DAILY_ADJUSTED')
      .set('symbol', symbol)
      .set('outputsize', 'compact')
      .set('apikey', this.key);

    const cacheKey = `stockDaily:${symbol.toUpperCase()}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

    const obs = this.http.get<any>(this.base, { params }).pipe(
      map(res => {
        const series = res['Time Series (Daily)'] || {};
        return Object.keys(series).map(date => ({ date, close: parseFloat(series[date]['4. close']) })).sort((a, b) => a.date.localeCompare(b.date));
      }),
      catchError(err => {
        console.error('getStockDaily', err);
        return throwError(() => new Error('Failed to load stock series'));
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.cache.set(cacheKey, obs);
    return obs;
  }

  /** DIGITAL_CURRENCY_DAILY for cryptos */
  getCryptoDaily(symbol: string): Observable<{ date: string; close: number }[]> {
    const params = new HttpParams()
      .set('function', 'DIGITAL_CURRENCY_DAILY')
      .set('symbol', symbol)
      .set('market', 'USD')
      .set('apikey', this.key);

    const cacheKey = `cryptoDaily:${symbol.toUpperCase()}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

    const obs = this.http.get<any>(this.base, { params }).pipe(
      map(res => {
        const series = res['Time Series (Digital Currency Daily)'] || {};
        return Object.keys(series).map(date => ({ date, close: parseFloat(series[date]['4a. close (USD)']) })).sort((a, b) => a.date.localeCompare(b.date));
      }),
      catchError(err => {
        console.error('getCryptoDaily', err);
        return throwError(() => new Error('Failed to load crypto series'));
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.cache.set(cacheKey, obs);
    return obs;
  }

  /** Lightweight asset detail: uses the latest point from its series */
  getAssetDetail(summary: AssetSummary): Observable<AssetDetail> {
    if (summary.type === 'crypto') {
      return this.getCryptoDaily(summary.symbol).pipe(
        map(series => {
          const last = series[series.length - 1];
          return {
            symbol: summary.symbol,
            name: summary.name,
            type: 'crypto' as const,
            currentPrice: last ? last.close : 0,
            currency: 'USD',
            lastUpdated: last?.date,
            history: series
          } as AssetDetail;
        }),
        catchError(err => {
          console.error('getAssetDetail (crypto) error', err);
          return throwError(() => new Error('Failed to load crypto detail'));
        })
      );
    } else {
      return this.getStockDaily(summary.symbol).pipe(
        map(series => {
          const last = series[series.length - 1];
          return {
            symbol: summary.symbol,
            name: summary.name,
            type: 'stock' as const,
            currentPrice: last ? last.close : 0,
            currency: summary.currency || 'USD',
            lastUpdated: last?.date,
            history: series
          } as AssetDetail;
        }),
        catchError(err => {
          console.error('getAssetDetail (stock) error', err);
          return throwError(() => new Error('Failed to load stock detail'));
        })
      );
    }
  }
}
