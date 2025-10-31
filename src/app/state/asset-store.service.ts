import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AssetSummary, AssetDetail } from '../models/asset.model';
import { MarketService } from '../services/market.service';

@Injectable({ providedIn: 'root' })
export class AssetStoreService {
  private selectedSubj = new BehaviorSubject<AssetDetail[]>([]);
  selected$: Observable<AssetDetail[]> = this.selectedSubj.asObservable();

  private timeRangeSubj = new BehaviorSubject<'7d'|'30d'|'6m'|'1y'>('30d');
  timeRange$ = this.timeRangeSubj.asObservable();

  constructor(private market: MarketService) {}

  addAsset(summary: AssetSummary) {
    const current = this.selectedSubj.getValue();
    if (current.find(a => a.symbol === summary.symbol)) return;
    if (current.length >= 5) return; // limit
    this.market.getAssetDetail(summary).subscribe(detail => {
      this.selectedSubj.next([...this.selectedSubj.getValue(), detail]);
    }, err => {
      console.error('Failed to add asset', err);
    });
  }

  removeAsset(symbol: string) {
    this.selectedSubj.next(this.selectedSubj.getValue().filter(a => a.symbol !== symbol));
  }

  setTimeRange(range: '7d'|'30d'|'6m'|'1y') {
    this.timeRangeSubj.next(range);
  }

  clear() {
    this.selectedSubj.next([]);
  }
}
