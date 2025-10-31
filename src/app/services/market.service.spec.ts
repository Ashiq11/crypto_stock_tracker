import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MarketService } from './market.service';
import { environment } from '../../environments/environment';

describe('MarketService', () => {
  let service: MarketService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MarketService]
    });
    service = TestBed.inject(MarketService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should search symbols and map results', (done) => {
    const mockResp = {
      bestMatches: [
        { '1. symbol': 'AAPL', '2. name': 'Apple Inc.', '4. region': 'United States', '8. currency': 'USD', '9. matchScore': '0.90' }
      ]
    };
    service.searchSymbols('apple').subscribe(res => {
      expect(res.length).toBe(1);
      expect(res[0].symbol).toBe('AAPL');
      done();
    });
    const req = httpMock.expectOne(r => r.url.includes(environment.alphaVantageBaseUrl));
    expect(req.request.method).toBe('GET');
    req.flush(mockResp);
  });

  it('should fetch stock daily series', (done) => {
    const mockResp = { 'Time Series (Daily)': { '2025-10-28': { '4. close': '150.00' }, '2025-10-29': { '4. close': '151.50' } } };
    service.getStockDaily('AAPL').subscribe(series => {
      expect(series.length).toBe(2);
      expect(series[1].close).toBeCloseTo(151.5);
      done();
    });
    const req = httpMock.expectOne(r => r.url.includes(environment.alphaVantageBaseUrl));
    req.flush(mockResp);
  });
});