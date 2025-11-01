import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SearchComponent } from './search.component';
import { MarketService } from '../../services/market.service';
import { AssetStoreService } from '../../state/asset-store.service';
import { AssetSummary } from '../../models/asset.model';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let marketServiceMock: jasmine.SpyObj<MarketService>;
  let storeMock: jasmine.SpyObj<AssetStoreService>;

  beforeEach(async () => {
    marketServiceMock = jasmine.createSpyObj('MarketService', ['searchSymbols']);
    storeMock = jasmine.createSpyObj('AssetStoreService', ['addAsset']);
    marketServiceMock.searchSymbols.and.returnValue(of([] as AssetSummary[]));

    await TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [
        { provide: MarketService, useValue: marketServiceMock },
        { provide: AssetStoreService, useValue: storeMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clear the input field', () => {
    component.control.setValue('AAPL');
    component.clear();
    expect(component.control.value).toBe('');
  });

  it('should call addAsset on select', () => {
    const mockItem: AssetSummary = {
      symbol: 'AAPL',
      name: 'Apple Inc',
      type: 'stock',
      region: 'US',
      currency: 'USD',
      matchScore: 1
    };
    component.select(mockItem);
    expect(storeMock.addAsset).toHaveBeenCalledWith(mockItem);
  });
});
