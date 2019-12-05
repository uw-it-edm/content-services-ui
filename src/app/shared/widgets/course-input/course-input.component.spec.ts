import { async, ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { CourseInputComponent } from './course-input.component';
import { FieldOption } from '../../../core/shared/model/field/field-option';
import { Field } from '../../../core/shared/model/field';
import { CourseConfig } from '../../../core/shared/model/field/course-config';
import { SharedModule } from '../../shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectChange } from '@angular/material';
import { StudentService } from '../../providers/student.service';
import { Observable, of } from 'rxjs';

class MockStudentService extends StudentService {
  constructor() {
    super(null, null);
  }

  getCourses(
    year: string,
    quarter: string,
    curriculum: string,
    courseNumber?: string,
    title?: string
  ): Observable<any> {
    const ret: any = {
      Courses: [
        {
          Year: '2019',
          Quarter: 'autumn',
          CurriculumAbbreviation: 'PHYS',
          CourseNumber: '101',
          CourseTitle: 'PHYS SCI INQUIRY I'
        },
        {
          Year: '2019',
          Quarter: 'autumn',
          CurriculumAbbreviation: 'PHYS',
          CourseNumber: '102',
          CourseTitle: 'PHY SCI INQUIRY I'
        },
        {
          Year: '2019',
          Quarter: 'autumn',
          CurriculumAbbreviation: 'PHYS',
          CourseNumber: '103',
          CourseTitle: 'PHY SCI INQUIRY I'
        },
        {
          Year: '2019',
          Quarter: 'autumn',
          CurriculumAbbreviation: 'PHYS',
          CourseNumber: '104',
          CourseTitle: 'GROUP INQUIRY I'
        },
        {
          Year: '2019',
          Quarter: 'autumn',
          CurriculumAbbreviation: 'PHYS',
          CourseNumber: '105',
          CourseTitle: 'GROUP INQUIRY II'
        }
      ],
      TotalCount: 153
    };

    return of(ret);
  }

  getSections(year: string, quarter: string, curriculum: string, courseNumber?: string): Observable<any> {
    const ret: any = {
      Sections: [
        { Year: '2019', Quarter: 'autumn', CurriculumAbbreviation: 'PHYS', CourseNumber: '101', SectionID: 'A' }
      ],
      TotalCount: 1
    };

    return of(ret);
  }
}

describe('CourseInputComponent', () => {
  let component: CourseInputComponent;
  let fixture: ComponentFixture<CourseInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule],
      declarations: [],
      providers: [{ provide: StudentService, useValue: new MockStudentService() }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseInputComponent);
    component = fixture.componentInstance;

    const field = new Field();
    field.courseConfig = new CourseConfig();
    component.fieldConfig = field;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate the initial value in the formGroup', () => {
    component.ngAfterContentInit();
    component.writeValue('2019|autumn|PHYS|101|PHYS SCI INQUIRY I|A');

    expect(component.formGroup.controls['yearInputForm'].value).toBe('2019');
    expect(component.formGroup.controls['quarterInputForm'].value).toBe('autumn');
    expect(component.formGroup.controls['courseInputForm'].value).toBe('101');
    expect(component.formGroup.controls['sectionInputForm'].value).toBe('A');
  });

  it('should update the model when a value is selected', () => {
    component.ngAfterContentInit();
    component.writeValue('2019|autumn|PHYS|101|PHYS SCI INQUIRY I|A');
    component.onSelectYear(new MatSelectChange(null, '2018'));
    component.onSelectQuarter(new MatSelectChange(null, 'winter'));
    component.onSelectCourse(new MatSelectChange(null, '102'));
    component.onSelectSection(new MatSelectChange(null, 'B'));
    expect(component.value).toBe('2018|winter|PHYS|102|PHY SCI INQUIRY I|B');
  });
});
