import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HeaderComponent } from './widgets/header/header.component';
import { MaterialConfigModule } from '../routing/material-config.module';
import { RouterModule } from '@angular/router';
import { FileUploadComponent } from './widgets/file-upload/file-upload.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { SafeCurrencyPipe } from './pipes/safe-currency.pipe';

import { CustomTextDirective } from './directives/custom-text/custom-text.directive';
import { DataService } from './providers/data.service';
import { FieldOptionService } from './providers/fieldoption.service';
import { StudentAutocompleteComponent } from './widgets/student-autocomplete/student-autocomplete.component';
import { StudentService } from './providers/student.service';
import { CheckboxInputComponent } from './widgets/checkbox/checkbox-input.component';
import { StudentDisplayComponent } from './widgets/student-display/student-display.component';
import { TimestampPickerComponent } from './widgets/timestamp-picker/timestamp-picker.component';
import { TruncatePipe } from './pipes/truncate.pipe';
import { DisplayFieldComponent } from './widgets/display-field/display-field.component';
import { ProgressService } from './providers/progress.service';
import { ApplicationStateService } from './providers/application-state.service';
import { FocusDirective } from './directives/focus/focus.directive';
import { OptionsInputComponent } from './widgets/options-input/options-input.component';
import { OptionsAutocompleteComponent } from './widgets/options-autocomplete/options-autocomplete.component';
import { OptionsMultiselectComponent } from './widgets/options-multiselect/options-multiselect.component';
import { NotificationComponent } from './widgets/notification/notification.component';
import { NotificationService } from './providers/notification.service';
import { ContentViewComponent } from '../content/content-view/content-view.component';
import { ContentToolbarComponent } from '../content/content-toolbar/content-toolbar.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DataApiValueService } from './providers/dataapivalue.service';
import { PersonService } from './providers/person.service';
import { PersonAutocompleteComponent } from './widgets/person-autocomplete/person-autocomplete.component';
import { PersonDisplayComponent } from './widgets/person-display/person-display.component';
import { DataApiValueDisplayComponent } from './widgets/data-api-display/data-api-value-display.component';
import { ListFieldDisplayComponent } from './widgets/list-field-display/list-field-display.component';
import { ElasticsearchDateValidatorDirective } from './directives/elasticsearch-date-validator/elasticsearch-date-validator.directive';
import { CourseInputComponent } from './widgets/course-input/course-input.component';
import { A11yModule } from '@angular/cdk/a11y';

@NgModule({
  imports: [CommonModule, MaterialConfigModule, RouterModule, ReactiveFormsModule, FormsModule, PdfViewerModule, A11yModule],
  exports: [
    CommonModule,
    CustomTextDirective,
    HeaderComponent,
    MaterialConfigModule,
    RouterModule,
    FileUploadComponent,
    SafeUrlPipe,
    SafeCurrencyPipe,
    CheckboxInputComponent,
    OptionsInputComponent,
    OptionsAutocompleteComponent,
    OptionsMultiselectComponent,
    StudentAutocompleteComponent,
    StudentDisplayComponent,
    PersonAutocompleteComponent,
    PersonDisplayComponent,
    DataApiValueDisplayComponent,
    ListFieldDisplayComponent,
    TimestampPickerComponent,
    TruncatePipe,
    DisplayFieldComponent,
    FocusDirective,
    ContentViewComponent,
    ContentToolbarComponent,
    CourseInputComponent,
    ElasticsearchDateValidatorDirective,
  ],
  declarations: [
    CustomTextDirective,
    HeaderComponent,
    FileUploadComponent,
    SafeUrlPipe,
    SafeCurrencyPipe,
    CheckboxInputComponent,
    OptionsInputComponent,
    OptionsAutocompleteComponent,
    OptionsMultiselectComponent,
    StudentAutocompleteComponent,
    StudentDisplayComponent,
    DataApiValueDisplayComponent,
    ListFieldDisplayComponent,
    PersonAutocompleteComponent,
    PersonDisplayComponent,
    TimestampPickerComponent,
    TruncatePipe,
    DisplayFieldComponent,
    FocusDirective,
    NotificationComponent,
    ContentViewComponent,
    ContentToolbarComponent,
    CourseInputComponent,
    ElasticsearchDateValidatorDirective,
  ],
  providers: [
    DataService,
    FieldOptionService,
    ProgressService,
    ApplicationStateService,
    StudentService,
    PersonService,
    DataApiValueService,
    NotificationService,
  ],
  entryComponents: [NotificationComponent],
})
export class SharedModule {}
