import { inject, TestBed } from '@angular/core/testing';

import { ContentService } from './content.service';
import { Http, HttpModule } from '@angular/http';

describe('ContentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [ContentService]
    });
  });

  it(
    'should be created',
    inject([ContentService, Http], (service: ContentService) => {
      expect(service).toBeTruthy();
    })
  );
});
