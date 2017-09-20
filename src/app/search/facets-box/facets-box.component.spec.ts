import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { Observable } from 'rxjs/Observable';
import { SearchModel } from '../shared/model/search-model';
import 'rxjs/add/observable/of';
import { FacetsBoxComponent } from './facets-box.component';
import { PageConfig } from '../../core/shared/model/page-config';
import { SearchFilter } from '../shared/model/search-filter';

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
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have an initialized searchModel ', () => {
    expect(component.searchModel.stringQuery).toBe('iSearch');
  });

  it('should add filters to searchModel', () => {
    const searchFilter = new SearchFilter('testKey', 'testString');
    component.addFacetFilter(searchFilter.key, searchFilter.value);
    expect(component.searchModel.filters).toEqual([searchFilter]);
  });
});
