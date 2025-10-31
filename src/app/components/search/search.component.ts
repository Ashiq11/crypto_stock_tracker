import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap, catchError } from 'rxjs/operators';
import { MarketService } from '../../services/market.service';
import { AssetStoreService } from '../../state/asset-store.service';
import { AssetSummary } from '../../models/asset.model';

@Component({
  selector: 'search-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit {
  control = new FormControl('');
  suggestions$: Observable<AssetSummary[]> = of([]);
  loading = false;
  error = '';

  constructor(private market: MarketService, private store: AssetStoreService) { }

  ngOnInit(): void {
    this.suggestions$ = this.control.valueChanges.pipe(
      debounceTime(300),
      filter((term): term is string => !!term && term.trim().length > 0),
      distinctUntilChanged(),
      switchMap((term: string) =>
        this.market.searchSymbols(term).pipe(
          catchError(err => {
            console.error('search error', err);
            this.error = 'Search failed. Try again later.';
            return of([]);
          })
        )
      ),
      tap(() => (this.loading = false))
    );
  }

  displayFn(item?: AssetSummary) {
    return item ? `${item.symbol} — ${item.name}` : '';
  }

  select(item: AssetSummary | null) {
    if (!item) return;
    this.store.addAsset(item);
    this.control.setValue('');
  }

  clear() {
    this.control.setValue('');
  }

  trackBySymbol(index: number, item: AssetSummary) {
    return item.symbol;
  }
}
