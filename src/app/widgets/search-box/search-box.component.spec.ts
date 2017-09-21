import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBoxComponent } from './search-box.component';
import { FormsModule } from '@angular/forms';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { Observable } from 'rxjs/Observable';
import { SearchModel } from '../../model/search/search-model';
import 'rxjs/add/observable/of';
import { PageConfig } from '../../model/config/page-config';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('SearchBoxComponent', () => {
  let component: SearchBoxComponent;
  let fixture: ComponentFixture<SearchBoxComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [FormsModule, MaterialConfigModule, NoopAnimationsModule],
        declarations: [SearchBoxComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBoxComponent);
    component = fixture.componentInstance;
    const searchModel = new SearchModel();
    searchModel.stringQuery = 'iSearch';
    component.searchModel$ = Observable.of(searchModel);
    component.pageConfig = new PageConfig();
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have an initialized searchModel ', () => {
    expect(component.searchModel.stringQuery).toBe('iSearch');
  });
});
