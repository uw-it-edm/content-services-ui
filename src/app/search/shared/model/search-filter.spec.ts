import { SearchFilter } from './search-filter';

describe('SearchFilter', () => {
  let searchFilter: SearchFilter;

  beforeEach(() => {
    searchFilter = new SearchFilter('filter1', 'value1');
  });

  it('should not be equals when key is not equal', () => {
    const secondSearchFilter = new SearchFilter('filter2', 'value1');

    expect(searchFilter.equals(secondSearchFilter)).toBeFalsy();
  });

  it('should not be equals when value is not equal', () => {
    const secondSearchFilter = new SearchFilter('filter1', 'value2');

    expect(searchFilter.equals(secondSearchFilter)).toBeFalsy();
  });

  it('should be equals when value and key are equal', () => {
    const secondSearchFilter = new SearchFilter('filter1', 'value1');

    expect(searchFilter.equals(secondSearchFilter)).toBeTruthy();
  });

  it('should not be equals when second filter is null', () => {
    expect(searchFilter.equals(null)).toBeFalsy();
  });

  it('should not be equals when key  is null', () => {
    const secondSearchFilter = new SearchFilter(null, 'value1');

    expect(searchFilter.equals(secondSearchFilter)).toBeFalsy();
  });
});
