import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AssetStoreService } from '../../state/asset-store.service';
import { Observable } from 'rxjs';
import { AssetDetail } from '../../models/asset.model';

@Component({
  selector: 'comparison-component',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, AsyncPipe],
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComparisonComponent {
  selected$!: Observable<AssetDetail[]>;

  constructor(private store: AssetStoreService) { }

  ngOnInit(): void {
    this.selected$ = this.store.selected$;
  }

  remove(symbol: string) {
    this.store.removeAsset(symbol);
  }

  clearAll() {
    this.store.clear();
  }

  trackBySymbol(index: number, item: AssetDetail) {
    return item.symbol;
  }
}
