import { SearchModel } from './search-model';
import { SearchFilter } from './search-filter';

describe('SearchModel', () => {
  let searchModel: SearchModel;

  beforeEach(() => {
    searchModel = new SearchModel();
    const searchFilter1 = new SearchFilter('filter1', 'value1', 'testLabel');
    const searchFilter2 = new SearchFilter('filter2', 'value2', 'testLabel');
    searchModel.addFilterIfNotThere(searchFilter1);
    searchModel.addFilterIfNotThere(searchFilter2);
  });

  it('should add filter if it is not there', () => {
    expect(searchModel.filters.length).toBe(2);

    expect(searchModel.hasFilterForKey('filter1')).toBeTruthy();

    const foundFilter = searchModel.filters.find(filter => filter.key === 'filter1');

    expect(foundFilter.key).toBe('filter1');
    expect(foundFilter.value).toBe('value1');
  });

  it('should not add filter if it is there', () => {
    const searchFilter2 = new SearchFilter('filter2', 'value2', 'testLabel');

    searchModel.addFilterIfNotThere(searchFilter2);

    expect(searchModel.filters.length).toBe(2);

    expect(searchModel.hasFilterForKey('filter2')).toBeTruthy();

    const foundFilter = searchModel.filters.find(filter => filter.key === 'filter2');

    expect(foundFilter.key).toBe('filter2');
    expect(foundFilter.value).toBe('value2');
  });

  it('should remove filter', () => {
    const searchFilter2 = new SearchFilter('filter2', 'value2', 'testLabel');
    searchModel.removeFilter(searchFilter2);
    expect(searchModel.filters.length).toBe(1);

    expect(searchModel.hasFilterForKey('filter2')).toBeFalsy();
  });
});
