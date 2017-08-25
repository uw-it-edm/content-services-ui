import { TestBed, inject } from '@angular/core/testing';

import { SearchService } from './search.service';
import { Http, HttpModule } from '@angular/http';

describe('SearchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [SearchService]
    });
  });

  it('should be created', inject([SearchService, Http], (service: SearchService) => {
    expect(service).toBeTruthy();
  }));
});
