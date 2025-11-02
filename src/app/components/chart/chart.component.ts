import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { Chart, ChartDataset, ChartOptions, FinancialDataPoint, registerables } from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import { AssetStoreService } from '../../state/asset-store.service';
import { combineLatest, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
// Register Chart.js and financial plugin
Chart.register(...registerables, CandlestickController, CandlestickElement);

@Component({
  selector: 'chart-component',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent implements OnInit {
  @ViewChild('chartCanvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
  chart!: Chart<'candlestick', FinancialDataPoint[], unknown>;
  chartData: { datasets: ChartDataset<'candlestick', FinancialDataPoint[]>[] } = { datasets: [] };
  timeRange: '7d' | '30d' | '6m' | '1y' = '30d';

  chartOptions: ChartOptions<'candlestick'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const d = ctx.raw as FinancialDataPoint;
            return `O: ${d.o}, H: ${d.h}, L: ${d.l}, C: ${d.c}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: { tooltipFormat: 'MMM dd, yyyy', unit: 'day' },
        title: { display: true, text: 'Date' }
      },
      y: { title: { display: true, text: 'Price (USD)' } }
    }
  };

  constructor(private store: AssetStoreService) {}

  ngOnInit() {
    combineLatest([this.store.selected$, this.store.timeRange$])
      .pipe(
        switchMap(([assets, range]) => {
          if (!assets || assets.length === 0) {
            this.chartData.datasets = [];
            return of(null);
          }

          // build datasets
          this.chartData.datasets = assets.map(asset => {
            const sliced = this.sliceByRange(asset.history || [], range);
            return {
              label: asset.symbol,
              data: sliced.map(p => ({
                x: new Date(p.date).getTime(),
                o: p.open,
                h: p.high,
                l: p.low,
                c: p.close
              })),
              borderColor: 'rgba(54, 162, 235, 0.8)',
              color: { up: 'rgba(34,197,94,1)', down: 'rgba(239,68,68,1)', unchanged: 'rgba(139, 92, 246,1)' }
            };
          });

          setTimeout(() => this.renderChart(), 0); // after DOM ready
          return of(this.chartData);
        })
      )
      .subscribe();
  }

  renderChart() {
    if (!this.canvas) return;
    if (this.chart) this.chart.destroy();

    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'candlestick',
      data: this.chartData,
      options: this.chartOptions
    });
  }

  sliceByRange(series: any[], range: '7d' | '30d' | '6m' | '1y') {
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
    this.timeRange = range;
    this.store.setTimeRange(range);
  }
}
