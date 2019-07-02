import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HeaderComponent } from './widgets/header/header.component';
import { MaterialConfigModule } from '../routing/material-config.module';
import { RouterModule } from '@angular/router';
import { FileUploadComponent } from './widgets/file-upload/file-upload.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SafeUrlPipe } from './pipes/safe-url.pipe';

import { CustomTextDirective } from './directives/custom-text/custom-text.directive';
import { DataService } from './providers/data.service';
import { StudentAutocompleteComponent } from './widgets/student-autocomplete/student-autocomplete.component';
import { StudentService } from './providers/student.service';
import { CheckboxInputComponent } from './widgets/checkbox/checkbox-input.component';
import { StudentDisplayComponent } from './widgets/student-display/student-display.component';
import { TimestampPickerComponent } from './widgets/timestamp-picker/timestamp-picker.component';
import { TruncatePipe } from './pipes/truncate.pipe';
import { DisplayFieldComponent } from './widgets/display-field/display-field.component';
import { ProgressService } from './providers/progress.service';
import { FocusDirective } from './directives/focus/focus.directive';
import { OptionsInputComponent } from './widgets/options-input/options-input.component';
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
import { ElasticsearchDateValidatorDirective } from './directives/elasticsearch-date-validator/elasticsearch-date-validator.directive';

@NgModule({
  imports: [CommonModule, MaterialConfigModule, RouterModule, ReactiveFormsModule, FormsModule, PdfViewerModule],
  exports: [
    CommonModule,
    CustomTextDirective,
    HeaderComponent,
    MaterialConfigModule,
    RouterModule,
    FileUploadComponent,
    SafeUrlPipe,
    CheckboxInputComponent,
    OptionsInputComponent,
    StudentAutocompleteComponent,
    StudentDisplayComponent,
    PersonAutocompleteComponent,
    PersonDisplayComponent,
    DataApiValueDisplayComponent,
    TimestampPickerComponent,
    TruncatePipe,
    DisplayFieldComponent,
    FocusDirective,
    ContentViewComponent,
    ContentToolbarComponent,
    ElasticsearchDateValidatorDirective
  ],
  declarations: [
    CustomTextDirective,
    HeaderComponent,
    FileUploadComponent,
    SafeUrlPipe,
    CheckboxInputComponent,
    OptionsInputComponent,
    StudentAutocompleteComponent,
    StudentDisplayComponent,
    DataApiValueDisplayComponent,
    PersonAutocompleteComponent,
    PersonDisplayComponent,
    TimestampPickerComponent,
    TruncatePipe,
    DisplayFieldComponent,
    FocusDirective,
    NotificationComponent,
    ContentViewComponent,
    ContentToolbarComponent,
    ElasticsearchDateValidatorDirective
  ],
  providers: [DataService, ProgressService, StudentService, PersonService, DataApiValueService, NotificationService],
  entryComponents: [NotificationComponent]
})
export class SharedModule {}
