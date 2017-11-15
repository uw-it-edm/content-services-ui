import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { StudentSearchModel } from '../../shared/model/student-search-model';
import { StudentService } from '../../providers/student.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { StudentSearchResults } from '../../shared/model/student-search-results';
import { Student } from '../../shared/model/student';

@Component({
  selector: 'app-student-autocomplete',
  templateUrl: './student-autocomplete.component.html',
  styleUrls: ['./student-autocomplete.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class StudentAutocompleteComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject();

  private searchModel$: Subject<StudentSearchModel> = new Subject<StudentSearchModel>();
  private searchResult$: Observable<StudentSearchResults> = new Observable<StudentSearchResults>();

  filteredOptions: Subject<Student[]> = new BehaviorSubject<Student[]>([]);
  formGroup: FormGroup;

  constructor(fb: FormBuilder, private studentService: StudentService) {
    this.formGroup = fb.group({
      studentAutocomplete: new FormControl()
    });
  }

  ngOnInit() {
    this.searchResult$ = this.studentService.search(this.searchModel$);
    this.searchResult$.takeUntil(this.componentDestroyed).subscribe((results: StudentSearchResults) => {
      this.filteredOptions.next(results.content);
    });

    //      TODO:
    //   1) search (last, first)
    //   if no results
    //   2)  search (first, last)
    //   if no results return no results
    this.formGroup.controls['studentAutocomplete'].valueChanges
      .startWith(null)
      .takeUntil(this.componentDestroyed)
      .map(student => (student && typeof student === 'object' ? student.displayName : student))
      .subscribe((term: string) => {
        this.search(term);
      });
  }

  private search(term: string) {
    console.log('autocomplete: ' + term);

    if (term) {
      if (term.trim().length > 1) {
        const searchModel = this.createSearchModel(term);
        this.searchModel$.next(searchModel);
      }
    } else {
      this.searchModel$.next(null);
    }
  }

  private createSearchModel(term: string) {
    const searchModel = new StudentSearchModel();

    // TODO: improve the create searchmodel stuff.. what if no comma, etc
    const names: string[] = term.split(',', 2).map(s => s.trim());
    searchModel.lastName = names[0];
    if (names.length > 1 && names[1].length > 0) {
      searchModel.firstName = names[1];
    }

    return searchModel;
  }

  displayFn(student: Student): string {
    return student ? student.displayName : null;
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }
}
