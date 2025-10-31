import { Component, ChangeDetectionStrategy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap, catchError, map } from 'rxjs/operators';
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
  error: string | null = null;

  // Declare the template reference for the autocomplete
  @ViewChild('auto', { static: true }) auto!: MatAutocomplete;

  constructor(private market: MarketService, private store: AssetStoreService) { }

  ngOnInit(): void {
    this.suggestions$ = this.control.valueChanges.pipe(
      debounceTime(400),
      map(v => (v || '').trim()),
      filter((v: string) => v.length > 0),
      distinctUntilChanged(),
      tap(() => { this.loading = true; this.error = ''; }),
      switchMap((term: string) =>
        this.market.searchSymbols(term).pipe(
          catchError(err => {
            console.error('search error', err);
            this.error = 'Search failed. Try again later.';
            return of([] as AssetSummary[]);
          })
        )
      ),
      tap(() => { this.loading = false; })
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
