import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { Observable } from 'rxjs/Observable';
import { SearchModel } from '../../model/search/search-model';
import 'rxjs/add/observable/of';
import { FacetsBoxComponent } from './facets-box.component';
import { PageConfig } from '../../model/config/page-config';
import { SearchResults } from '../../model/search-result';

describe('FacetsBoxComponent', () => {
  let component: FacetsBoxComponent;
  let fixture: ComponentFixture<FacetsBoxComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [FormsModule, MaterialConfigModule],
        declarations: [FacetsBoxComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(FacetsBoxComponent);
    component = fixture.componentInstance;
    const searchModel = new SearchModel();
    searchModel.stringQuery = 'iSearch';
    component.searchModel$ = Observable.of(searchModel);
    component.pageConfig = new PageConfig();

    const searchResults = new SearchResults();
    component.searchResults$ = Observable.of(searchResults);

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have an initialized searchModel ', () => {
    expect(component.searchModel.stringQuery).toBe('iSearch');
  });
});
