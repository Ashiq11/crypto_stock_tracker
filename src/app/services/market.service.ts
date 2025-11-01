import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { AssetSummary, AssetDetail, HistoricalPrice, AssetMetaData } from '../models/asset.model';

@Injectable({ providedIn: 'root' })
export class MarketService {
  private base = environment.alphaVantageBaseUrl || 'https://www.alphavantage.co/query';
  private key = environment.alphaVantageApiKey || 'demo';
  private cache = new Map<string, Observable<any>>();

  constructor(private http: HttpClient) { }

  /** Search symbols using SYMBOL_SEARCH API */
  searchSymbols(query: string): Observable<AssetSummary[]> {
    if (!query || !query.trim()) return of([]);

    const params = new HttpParams()
      .set('function', 'SYMBOL_SEARCH')
      .set('keywords', query.trim())
      .set('apikey', this.key);

    return this.http.get<any>(this.base, { params }).pipe(
      map(res => {
        if (!res || !Array.isArray(res.bestMatches)) {
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
  }

  /** TIME_SERIES_DAILY_ADJUSTED for stocks — returns OHLC history + meta */
  getStockDaily(symbol: string, outputSize: 'compact' | 'full' = 'compact'):
    Observable<{ meta: AssetMetaData; series: HistoricalPrice[] }> {

    const cacheKey = `stockDaily:${symbol.toUpperCase()}:${outputSize}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

    const params = new HttpParams()
      .set('function', 'TIME_SERIES_DAILY_ADJUSTED')
      .set('symbol', symbol)
      .set('outputsize', outputSize)
      .set('apikey', this.key);

    const obs = this.http.get<any>(this.base, { params }).pipe(
      map(res => {
        const meta: AssetMetaData = {
          information: res['Meta Data']?.['1. Information'],
          symbol: res['Meta Data']?.['2. Symbol'],
          lastRefreshed: res['Meta Data']?.['3. Last Refreshed'],
          outputSize: res['Meta Data']?.['4. Output Size'],
          timeZone: res['Meta Data']?.['5. Time Zone']
        };

        const series = Object.entries<any>(res['Time Series (Daily)'] || {}).map(([date, val]) => ({
          date,
          open: parseFloat(val['1. open']),
          high: parseFloat(val['2. high']),
          low: parseFloat(val['3. low']),
          close: parseFloat(val['4. close']),
          volume: parseInt(val['5. volume'])
        }));

        return {
          meta,
          series: series.sort((a, b) => a.date.localeCompare(b.date)) // ascending
        };
      }),
      catchError(err => {
        console.error('getStockDaily error', err);
        return of({ meta: {}, series: [] });
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.cache.set(cacheKey, obs);
    return obs;
  }

  /** DIGITAL_CURRENCY_DAILY for cryptos — returns OHLC (in USD) */
  getCryptoDaily(symbol: string): Observable<{ meta: AssetMetaData; series: HistoricalPrice[] }> {
    const cacheKey = `cryptoDaily:${symbol.toUpperCase()}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

    const params = new HttpParams()
      .set('function', 'DIGITAL_CURRENCY_DAILY')
      .set('symbol', symbol)
      .set('market', 'USD')
      .set('apikey', this.key);

    const obs = this.http.get<any>(this.base, { params }).pipe(
      map(res => {
        const meta: AssetMetaData = {
          information: res['Meta Data']?.['1. Information'],
          symbol: res['Meta Data']?.['2. Digital Currency Code'],
          lastRefreshed: res['Meta Data']?.['6. Last Refreshed'],
          outputSize: 'Full',
          timeZone: res['Meta Data']?.['7. Time Zone']
        };

        const series = Object.entries<any>(res['Time Series (Digital Currency Daily)'] || {}).map(([date, val]) => ({
          date,
          open: parseFloat(val['1a. open (USD)']),
          high: parseFloat(val['2a. high (USD)']),
          low: parseFloat(val['3a. low (USD)']),
          close: parseFloat(val['4a. close (USD)']),
          volume: parseFloat(val['5. volume'])
        }));

        return {
          meta,
          series: series.sort((a, b) => a.date.localeCompare(b.date))
        };
      }),
      catchError(err => {
        console.error('getCryptoDaily error', err);
        return of({ meta: {}, series: [] });
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.cache.set(cacheKey, obs);
    return obs;
  }

  /** Builds a unified AssetDetail (for chart, comparison, etc.) */
  getAssetDetail(summary: AssetSummary): Observable<AssetDetail> {
    const isCrypto = summary.type === 'crypto';
    const source$ = isCrypto ? this.getCryptoDaily(summary.symbol) : this.getStockDaily(summary.symbol);

    return source$.pipe(
      map(({ meta, series }) => {
        const last = series[series.length - 1];
        return {
          symbol: summary.symbol,
          name: summary.name,
          type: summary.type,
          currentPrice: last?.close ?? 0,
          currency: summary.currency || 'USD',
          lastUpdated: meta.lastRefreshed,
          meta,
          history: series
        } as AssetDetail;
      }),
      catchError(err => {
        console.error('getAssetDetail error', err);
        return throwError(() => new Error('Failed to load asset detail'));
      })
    );
  }
}
