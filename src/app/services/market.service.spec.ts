import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MarketService } from './market.service';

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

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should map searchSymbols correctly', () => {
    const mockResponse = {
      bestMatches: [
        {
          '1. symbol': 'AAPL',
          '2. name': 'Apple Inc',
          '4. region': 'United States',
          '8. currency': 'USD',
          '9. matchScore': '1.0000'
        }
      ]
    };

    service.searchSymbols('apple').subscribe(data => {
      expect(data[0].symbol).toBe('AAPL');
      expect(data[0].currency).toBe('USD');
    });

    const req = httpMock.expectOne(() => true);
    req.flush(mockResponse);
  });
});
