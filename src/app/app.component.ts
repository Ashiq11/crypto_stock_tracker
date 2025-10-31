import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ChartComponent } from './components/chart/chart.component';
import { ComparisonComponent } from './components/comparison/comparison.component';
import { SearchComponent } from './components/search/search.component';
import { AssetStoreService } from './state/asset-store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    SearchComponent,
    ComparisonComponent,
    ChartComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(private store: AssetStoreService) {}
}
