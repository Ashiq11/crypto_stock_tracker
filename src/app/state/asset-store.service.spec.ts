import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AssetStoreService } from './asset-store.service';
import { MarketService } from '../services/market.service';
import { environment } from '../../environments/environment';

describe('AssetStoreService', () => {
  let service: AssetStoreService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AssetStoreService, MarketService]
    });
    service = TestBed.inject(AssetStoreService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add and remove asset', (done) => {
    const summary = { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' } as any;
    // mock stock daily response
    const mockResp = { 'Time Series (Daily)': { '2025-10-28': { '4. close': '150.00' } } };
    service.selected$.subscribe(list => {
      // When asset is added, list length should be 1
      if (list.length === 1) {
        expect(list[0].symbol).toBe('AAPL');
        service.removeAsset('AAPL');
      }
      // After removal, list should be 0
      if (list.length === 0) {
        done();
      }
    });
    service.addAsset(summary);
    const req = httpMock.expectOne(r => r.url.includes(environment.alphaVantageBaseUrl));
    req.flush(mockResp);
  });
});
