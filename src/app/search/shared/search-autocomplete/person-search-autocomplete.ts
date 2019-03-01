import { Observable } from 'rxjs/Observable';
import { SearchAutocomplete } from './search-autocomplete';
import { SearchFilter } from '../model/search-filter';
import { PersonService } from '../../../shared/providers/person.service';
import { PersonSearchResults } from '../../../shared/shared/model/person-search-results';
import { FilterableValue, Person } from '../../../shared/shared/model/person';

export class PersonSearchAutocomplete implements SearchAutocomplete {
  constructor(private personService: PersonService, private filterKey: string, private filterLabel: string) {}

  public createFilter(value: FilterableValue): SearchFilter {
    console.log('created filter ' + this.filterKey + ' - ' + value + ' - ' + this.filterLabel);

    return new SearchFilter(this.filterKey, value.value, this.filterLabel, value.displayValue);
  }

  public autocomplete(query: string): Observable<Person[]> {
    return this.personService.autocomplete(query).map((results: PersonSearchResults) => results.content);
  }
}
