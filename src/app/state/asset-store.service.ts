import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AssetSummary, AssetDetail } from '../models/asset.model';
import { MarketService } from '../services/market.service';

@Injectable({ providedIn: 'root' })
export class AssetStoreService {
  // selected asset details (max 5)
  private selectedSubj = new BehaviorSubject<AssetDetail[]>([]);
  selected$: Observable<AssetDetail[]> = this.selectedSubj.asObservable();

  // time range for charts
  private timeRangeSubj = new BehaviorSubject<'7d' | '30d' | '6m' | '1y'>('30d');
  timeRange$ = this.timeRangeSubj.asObservable();

  // simple helper to read current array
  get selectedValue(): AssetDetail[] {
    return this.selectedSubj.getValue();
  }

  constructor(private market: MarketService) { }

  addAsset(summary: AssetSummary) {
    if (!summary) return;

    const current = this.selectedSubj.getValue();
    if (current.find(a => a.symbol === summary.symbol)) return;
    if (current.length >= 5) return;

    this.market.getAssetDetail(summary).subscribe({
      next: (detail) => this.selectedSubj.next([...current, detail]),
      error: (err) => console.error('AssetStoreService.addAsset error', err)
    });
  }

  removeAsset(symbol: string) {
    this.selectedSubj.next(this.selectedSubj.getValue().filter(a => a.symbol !== symbol));
  }

  clear() {
    this.selectedSubj.next([]);
  }

  setTimeRange(range: '7d' | '30d' | '6m' | '1y') {
    this.timeRangeSubj.next(range);
  }
}