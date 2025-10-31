import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import type { ChartOptions, ChartDataset, ChartData, ChartType } from 'chart.js';
import { AssetStoreService } from '../../state/asset-store.service';
import { of, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

type LineChartType = 'line';
type LineData = number[];

// Note: explicit ChartData<'line', number[], string|unknown>
// and ChartDataset<'line', number[]> for datasets
@Component({
  selector: 'chart-component',
  standalone: true,
  imports: [CommonModule, NgChartsModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent implements OnInit {
  // Explicit typing for line chart data
  public chartData: ChartData<'line', LineData, string | unknown> = {
    labels: [],
    datasets: []
  };

  public chartOptions: ChartOptions<'line'> = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { position: 'top' } }
  };

  timeRange: '7d' | '30d' | '6m' | '1y' = '30d';

  constructor(private store: AssetStoreService) {}

  ngOnInit(): void {
    // combine selected assets and time range
    combineLatest([this.store.selected$, this.store.timeRange$])
      .pipe(
        switchMap(([list, range]) => {
          if (!list || list.length === 0) {
            this.chartData = { labels: [], datasets: [] };
            return of(null);
          }

          // Build typed datasets
          const datasetsTyped: ChartDataset<'line', LineData>[] = list.map(asset => {
            const full = asset.history || [];
            const sliced = this.sliceByRange(full, range);
            const data = sliced.map(p => p.close);

            // Create a dataset explicitly typed for 'line'
            const ds: ChartDataset<'line', LineData> = {
              label: asset.symbol,
              data,
              // optional styling, no 'type' property — keep it line
              tension: 0.2,
              fill: false
            };

            return ds;
          });

          // Use labels from first series (assumes aligned)
          const labels = (list[0].history || []).slice(-datasetsTyped[0]?.data.length || 0).map(p => p.date);

          // assign typed chart data
          this.chartData = {
            labels,
            datasets: datasetsTyped
          };

          return of(datasetsTyped);
        })
      )
      .subscribe({
        next: () => {},
        error: err => console.error('chart error', err)
      });
  }

  sliceByRange(series: { date: string; close: number }[], range: '7d'|'30d'|'6m'|'1y') {
    if (!series || series.length === 0) return [];
    const n = series.length;
    let take = 30;
    switch(range) {
      case '7d': take = 7; break;
      case '30d': take = 30; break;
      case '6m': take = Math.min(180, n); break;
      case '1y': take = Math.min(365, n); break;
    }
    return series.slice(Math.max(0, n - take), n);
  }

  onTimeRangeChange(range: '7d'|'30d'|'6m'|'1y') {
    this.store.setTimeRange(range);
  }
}
