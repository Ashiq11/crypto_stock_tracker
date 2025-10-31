import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { AssetSummary, AssetDetail } from '../models/asset.model';

@Injectable({ providedIn: 'root' })
export class MarketService {
  private base = environment.alphaVantageBaseUrl || 'https://www.alphavantage.co/query';
  private key = environment.alphaVantageApiKey || 'demo';
  private cache = new Map<string, Observable<any>>();

  constructor(private http: HttpClient) { }

  /**
   * Search symbols using SYMBOL_SEARCH 
   * Returns a list of best matches. We map to AssetSummary.
  */
  searchSymbols(query: string): Observable<AssetSummary[]> {
  if (!query || !query.trim()) return of([]);

  const params = new HttpParams()
    .set('function', 'SYMBOL_SEARCH')
    .set('keywords', query.trim())
    .set('apikey', this.key);

  const obs = this.http.get<any>(this.base, { params }).pipe(
    map(res => {
      if (!res || !Array.isArray(res.bestMatches)) {
        console.error('Alpha Vantage API returned unexpected payload:', res);
        throw new Error(res?.Note || res?.Information || 'Unexpected API response');
      }

      return res.bestMatches.map((m: any) => ({
        symbol: m['1. symbol'],
        name: m['2. name'],
        type: 'stock' as const,
        region: m['4. region'],
        currency: m['8. currency'] || 'USD',
        matchScore: parseFloat(m['9. matchScore'] || '0')
      }));
    }),
    catchError(err => {
      console.error('searchSymbols error', err);
      return throwError(() => new Error('Failed to search symbols'));
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  return obs;
}

  /** TIME_SERIES_DAILY_ADJUSTED for stocks */
  getStockDaily(symbol: string, outputSize: 'compact' | 'full' = 'compact'): Observable<{ date: string; close: number }[]> {
    const cacheKey = `stockDaily:${symbol.toUpperCase()}:${outputSize}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

    const params = new HttpParams()
      .set('function', 'TIME_SERIES_DAILY_ADJUSTED')
      .set('symbol', symbol)
      .set('outputsize', outputSize)
      .set('apikey', this.key);

    const obs = this.http.get<any>(this.base, { params }).pipe(
      map(res => {
        const series = res['Time Series (Daily)'] || {};
        return Object.keys(series)
          .map(date => ({ date, close: parseFloat(series[date]['4. close']) }))
          .sort((a, b) => a.date.localeCompare(b.date)); // ascending
      }),
      catchError(err => {
        console.error('MarketService.getStockDaily error', err);
        return of([] as { date: string; close: number }[]);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.cache.set(cacheKey, obs);
    return obs;
  }

  /**
   * DIGITAL_CURRENCY_DAILY for cryptos (close in USD)
   */
  getCryptoDaily(symbol: string): Observable<{ date: string; close: number }[]> {
    const cacheKey = `cryptoDaily:${symbol.toUpperCase()}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

    const params = new HttpParams()
      .set('function', 'DIGITAL_CURRENCY_DAILY')
      .set('symbol', symbol)
      .set('market', 'USD')
      .set('apikey', this.key);

    const obs = this.http.get<any>(this.base, { params }).pipe(
      map(res => {
        const series = res['Time Series (Digital Currency Daily)'] || {};
        return Object.keys(series)
          .map(date => ({ date, close: parseFloat(series[date]['4a. close (USD)']) }))
          .sort((a, b) => a.date.localeCompare(b.date));
      }),
      catchError(err => {
        console.error('MarketService.getCryptoDaily error', err);
        return of([] as { date: string; close: number }[]);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.cache.set(cacheKey, obs);
    return obs;
  }

  /**
   * TIME_SERIES_INTRADAY - optional, for intraday view
   * interval examples: '1min', '5min', '15min', '30min', '60min'
   */
  getIntraday(symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min'): Observable<{ date: string; close: number }[]> {
    const cacheKey = `intraday:${symbol.toUpperCase()}:${interval}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

    const params = new HttpParams()
      .set('function', 'TIME_SERIES_INTRADAY')
      .set('symbol', symbol)
      .set('interval', interval)
      .set('outputsize', 'compact')
      .set('apikey', this.key);

    const obs = this.http.get<any>(this.base, { params }).pipe(
      map(res => {
        // key name varies by interval
        const keyName = Object.keys(res).find(k => k.includes('Time Series'));
        const series = keyName ? res[keyName] : {};
        return Object.keys(series)
          .map((date: string) => ({ date, close: parseFloat(series[date]['4. close']) }))
          .sort((a, b) => a.date.localeCompare(b.date));
      }),
      catchError(err => {
        console.error('MarketService.getIntraday error', err);
        return of([] as { date: string; close: number }[]);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.cache.set(cacheKey, obs);
    return obs;
  }

  /**
   * Lightweight AssetDetail builder: picks the right series method based on type
   * summary.type must be either 'stock' or 'crypto'
   */
  getAssetDetail(summary: AssetSummary): Observable<AssetDetail> {
    if (summary.type === 'crypto') {
      return this.getCryptoDaily(summary.symbol).pipe(
        map(series => {
          const last = series[series.length - 1];
          return {
            symbol: summary.symbol,
            name: summary.name,
            type: 'crypto',
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
            type: 'stock',
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
