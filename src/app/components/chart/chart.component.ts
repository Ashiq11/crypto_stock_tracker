import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import type { ChartConfiguration, ChartOptions, ChartDataset, ChartData } from 'chart.js';
import { AssetStoreService } from '../../state/asset-store.service';
import { combineLatest, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';


@Component({
  selector: 'chart-component',
  standalone: true,
  imports: [CommonModule, NgChartsModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent implements OnInit {
  // Explicitly typed for line charts
  public chartData: ChartData<'line', number[], string | unknown> = { labels: [], datasets: [] };
  public chartOptions: ChartOptions<'line'> = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { position: 'top' } }
  };

  timeRange: '7d' | '30d' | '6m' | '1y' = '30d';

  constructor(private store: AssetStoreService) { }

  ngOnInit(): void {
    combineLatest([this.store.selected$, this.store.timeRange$])
      .pipe(
        switchMap(([list, range]) => {
          if (!list || list.length === 0) {
            this.chartData = { labels: [], datasets: [] };
            return of(null);
          }

          // build typed datasets
          const datasets: ChartDataset<'line', number[]>[] = list.map(asset => {
            const full = asset.history || [];
            const sliced = this.sliceByRange(full, range);
            const data = sliced.map(p => p.close);
            const ds: ChartDataset<'line', number[]> = {
              label: asset.symbol,
              data,
              tension: 0.2,
              fill: false
            };
            return ds;
          });

          // labels: use dates from first series (ascending)
          const firstSeries = list[0].history || [];
          const labels = this.sliceByRange(firstSeries, range).map(p => p.date);

          this.chartData = { labels, datasets };
          return of(this.chartData);
        })
      )
      .subscribe({ next: () => { }, error: (e) => console.error(e) });
  }

  sliceByRange(series: { date: string; close: number }[], range: '7d' | '30d' | '6m' | '1y') {
    if (!series || series.length === 0) return [];
    const n = series.length;
    let take = 30;
    switch (range) {
      case '7d': take = 7; break;
      case '30d': take = 30; break;
      case '6m': take = Math.min(180, n); break;
      case '1y': take = Math.min(365, n); break;
    }
    return series.slice(Math.max(0, n - take), n);
  }

  onTimeRangeChange(range: '7d' | '30d' | '6m' | '1y') {
    this.store.setTimeRange(range);
    this.timeRange = range;
  }
}
