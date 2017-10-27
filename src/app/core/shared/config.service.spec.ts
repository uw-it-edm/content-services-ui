import { inject, TestBed } from '@angular/core/testing';

import { ConfigService } from './config.service';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';

describe('ConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpModule],
      providers: [ConfigService]
    });
  });

  it(
    'should be created',
    inject([ConfigService], (service: ConfigService) => {
      expect(service).toBeTruthy();
    })
  );

  it(
    'should return a Promise',
    inject([ConfigService], (service: ConfigService) => {
      expect(service.getConfigForTenant('test')).toBeTruthy();
    })
  );

  it(
    'should have a Demo profile',
    inject([ConfigService], (service: ConfigService) => {
      service.getConfigForTenant('demo').then(demoConfig => {
        expect(demoConfig).toBeTruthy();
        expect(demoConfig.tenant).toBe('Demo');
      });
    })
  );
});
