import { StudentService } from '../../../shared/providers/student.service';
import { Observable } from 'rxjs/Observable';
import { SearchAutocomplete } from './search-autocomplete';
import { SearchFilter } from '../model/search-filter';
import { StudentSearchResults } from '../../../shared/shared/model/student-search-results';
import { Student } from '../../../shared/shared/model/student';
import { FilterableValue } from '../../../shared/shared/model/person';

export class StudentSearchAutocomplete implements SearchAutocomplete {
  constructor(private studentService: StudentService, private filterKey: string, private filterLabel: string) {}

  public createFilter(value: FilterableValue): SearchFilter {
    return new SearchFilter(this.filterKey, value.value, this.filterLabel);
  }

  public autocomplete(query: string): Observable<Student[]> {
    return this.studentService
      .autocomplete(query)
      .map((results: StudentSearchResults) => results.content)
      .map((students: Student[]) => {
        // convert the student result from an object like a 'Student' but not an instance of the student class
        return students.map((student: Student) => {
          return Object.assign(new Student(), student);
        });
      });
  }
}
