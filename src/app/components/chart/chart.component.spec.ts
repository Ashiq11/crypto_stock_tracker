import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, BehaviorSubject } from 'rxjs';
import { ChartComponent } from './chart.component';
import { AssetStoreService } from '../../state/asset-store.service';

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;
  let mockStore: jasmine.SpyObj<AssetStoreService>;

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj('AssetStoreService', ['setTimeRange'], {
      selected$: of([
        {
          symbol: 'AAPL',
          name: 'Apple',
          type: 'stock',
          currentPrice: 175.5,
          history: [
            { date: '2025-10-28', open: 172, high: 176, low: 170, close: 175 },
            { date: '2025-10-29', open: 175, high: 177, low: 173, close: 176 },
          ],
        },
      ]),
      timeRange$: new BehaviorSubject<'7d' | '30d' | '6m' | '1y'>('30d'),
    });

    await TestBed.configureTestingModule({
      imports: [ChartComponent],
      providers: [{ provide: AssetStoreService, useValue: mockStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update chart data from store', () => {
    expect(component.chartData.datasets.length).toBeGreaterThan(0);
  });

  it('should handle range change', () => {
    component.onTimeRangeChange('7d');
    expect(component.timeRange).toBe('7d');
    expect(mockStore.setTimeRange).toHaveBeenCalledWith('7d');
  });
});
