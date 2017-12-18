import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { StudentService } from '../../providers/student.service';
import { Student } from '../../shared/model/student';
import { Subject } from 'rxjs/Subject';
import { isNumeric } from 'rxjs/util/isNumeric';

@Component({
  selector: 'app-student-display',
  templateUrl: './student-display.component.html',
  styleUrls: ['./student-display.component.css']
})
export class StudentDisplayComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject();

  @Input() value: string;

  displayName: string;
  invalidStudentNumber: boolean;

  constructor(private studentService: StudentService) {}

  ngOnInit() {
    if (isNumeric(this.value)) {
      this.studentService
        .read(this.value)
        .takeUntil(this.componentDestroyed)
        .subscribe(
          (student: Student) => {
            this.displayName = Student.convertToDisplayName(student);
            this.invalidStudentNumber = false;
          },
          err => {
            this.invalidUser();
          }
        );
    } else {
      this.invalidUser();
    }
  }

  private invalidUser() {
    this.displayName = this.value;
    this.invalidStudentNumber = true;
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }
}
