import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ComparisonComponent } from './comparison.component';
import { AssetStoreService } from '../../state/asset-store.service';
import { AssetDetail } from '../../models/asset.model';

describe('ComparisonComponent', () => {
  let component: ComparisonComponent;
  let fixture: ComponentFixture<ComparisonComponent>;
  let storeMock: jasmine.SpyObj<AssetStoreService>;

  beforeEach(async () => {
    storeMock = jasmine.createSpyObj('AssetStoreService', ['removeAsset', 'clear'], {
      selected$: of([] as AssetDetail[])
    });

    await TestBed.configureTestingModule({
      imports: [ComparisonComponent],
      providers: [{ provide: AssetStoreService, useValue: storeMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(ComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call removeAsset when remove() is called', () => {
    component.remove('AAPL');
    expect(storeMock.removeAsset).toHaveBeenCalledWith('AAPL');
  });

  it('should call clear() when clearAll() is called', () => {
    component.clearAll();
    expect(storeMock.clear).toHaveBeenCalled();
  });
});
