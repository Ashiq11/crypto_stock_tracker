import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AssetStoreService } from './asset-store.service';
import { MarketService } from '../services/market.service';
import { AssetSummary } from '../models/asset.model';

describe('AssetStoreService', () => {
  let service: AssetStoreService;
  let marketServiceSpy: jasmine.SpyObj<MarketService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('MarketService', ['getAssetDetail']);

    TestBed.configureTestingModule({
      providers: [
        AssetStoreService,
        { provide: MarketService, useValue: spy }
      ]
    });

    service = TestBed.inject(AssetStoreService);
    marketServiceSpy = TestBed.inject(MarketService) as jasmine.SpyObj<MarketService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add asset', () => {
    const mockSummary: AssetSummary = { symbol: 'AAPL', name: 'Apple', type: 'stock' };
    marketServiceSpy.getAssetDetail.and.returnValue(of({
      symbol: 'AAPL', name: 'Apple', type: 'stock', currentPrice: 100
    }));

    service.addAsset(mockSummary);
    service.selected$.subscribe(list => {
      expect(list.length).toBe(1);
    });
  });
});
