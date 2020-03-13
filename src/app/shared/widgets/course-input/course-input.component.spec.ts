import { async, ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { CourseInputComponent } from './course-input.component';
import { Field } from '../../../core/shared/model/field';
import { CourseConfig } from '../../../core/shared/model/field/course-config';
import { SharedModule } from '../../shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectChange } from '@angular/material';
import { StudentService } from '../../providers/student.service';
import { Observable, of } from 'rxjs';
import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

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
        { Year: '2019', Quarter: 'autumn', CurriculumAbbreviation: 'PHYS', CourseNumber: '101', SectionID: 'A' },
        { Year: '2019', Quarter: 'autumn', CurriculumAbbreviation: 'PHYS', CourseNumber: '102', SectionID: 'A' },
        { Year: '2019', Quarter: 'autumn', CurriculumAbbreviation: 'PHYS', CourseNumber: '102', SectionID: 'B' },
        { Year: '2019', Quarter: 'autumn', CurriculumAbbreviation: 'PHYS', CourseNumber: '103', SectionID: 'A' }
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
    component.onSelectYear(new MatSelectChange(null, '2019'));
    component.onSelectQuarter(new MatSelectChange(null, 'autumn'));
    component.onSelectCourse(new MatSelectChange(null, '102'));
    component.onSelectSection(new MatSelectChange(null, 'B'));
    expect(component.value).toBe('2019|autumn|PHYS|102|PHY SCI INQUIRY I|B');
    expect(component.courseOptions.length).toBe(3);
    expect(component.courseOptions[0].sections.length).toBe(1);
    expect(component.courseOptions[1].sections.length).toBe(2);
    expect(component.courseOptions[2].sections.length).toBe(1);
    expect(component.sectionOptions.length).toBe(2);
  });
});

@Component({
  template: `
    <div [formGroup]="formGroup">
      <app-course-input
        [formControlName]="'testFormControlName'"
        [fieldConfig]="field"
        [id]="'test-custom-input'">
      </app-course-input>
    </div>
  `
})
class TestHostComponent {
  public field: Field;
  public formGroup: FormGroup;

  constructor() {
    this.field = new Field();
    this.field.courseConfig = new CourseConfig();
    this.formGroup = new FormGroup({
      testFormControlName: new FormControl()
    });
  }
}

describe('CourseInputComponent with host', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: CourseInputComponent;
  let dropDownElements: HTMLElement[];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule, ReactiveFormsModule],
      declarations: [TestHostComponent],
      providers: [{ provide: StudentService, useValue: new MockStudentService() }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    dropDownElements = fixture.debugElement.queryAll(By.css('mat-select')).map(e => e.nativeElement);

    const childDebugElement = fixture.debugElement.query(By.directive(CourseInputComponent));
    component = childDebugElement.componentInstance;

    fixture.detectChanges();
  });

  it('should render aria-label set to placeholder and value for Year dropdown', async(() => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(dropDownElements[0].getAttribute('aria-label')).toEqual('Year 2020');
    });
  }));

  it('should render aria-label set to placeholder and value for Quarter dropdown', async(() => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(dropDownElements[1].getAttribute('aria-label')).toEqual('Quarter autumn');
    });
  }));

  it('should render aria-label set to placeholder and value for Course dropdown', async(() => {
    fixture.whenStable().then(() => {
      component.ngAfterContentInit();
      component.writeValue('2019|autumn|PHYS|101|PHYS SCI INQUIRY I|A');

      fixture.detectChanges();

      expect(dropDownElements[2].getAttribute('aria-label')).toEqual('Course 101-PHYS SCI INQUIRY I');
    });
  }));

  it('should render aria-label set to placeholder for Course dropdown when course number is empty', async(() => {
    fixture.whenStable().then(() => {
      component.ngAfterContentInit();
      component.writeValue('2020|autumn|||PHYS SCI INQUIRY I|');
      fixture.detectChanges();

      expect(dropDownElements[2].getAttribute('aria-label')).toEqual('Course');
    });
  }));

  it('should render aria-label set to placeholder for Course dropdown when course title is empty', async(() => {
    fixture.whenStable().then(() => {
      component.ngAfterContentInit();
      component.writeValue('2020|autumn||101||');
      fixture.detectChanges();

      expect(dropDownElements[2].getAttribute('aria-label')).toEqual('Course');
    });
  }));

  it('should render aria-label set to placeholder and value for Section dropdown', async(() => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(dropDownElements[3].getAttribute('aria-label')).toEqual('Section A');
    });
  }));
});
