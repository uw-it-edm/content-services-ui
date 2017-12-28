import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HeaderComponent } from './widgets/header/header.component';
import { MaterialConfigModule } from '../routing/material-config.module';
import { RouterModule } from '@angular/router';
import { FileUploadComponent } from './widgets/file-upload/file-upload.component';
import { ReactiveFormsModule } from '@angular/forms';
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
import { NotificationComponent } from './widgets/notification/notification.component';
import { NotificationService } from './providers/notification.service';

@NgModule({
  imports: [CommonModule, MaterialConfigModule, RouterModule, ReactiveFormsModule],
  exports: [
    CommonModule,
    CustomTextDirective,
    HeaderComponent,
    MaterialConfigModule,
    RouterModule,
    FileUploadComponent,
    SafeUrlPipe,
    CheckboxInputComponent,
    StudentAutocompleteComponent,
    StudentDisplayComponent,
    TimestampPickerComponent,
    TruncatePipe,
    DisplayFieldComponent,
    FocusDirective
  ],
  declarations: [
    CustomTextDirective,
    HeaderComponent,
    FileUploadComponent,
    SafeUrlPipe,
    CheckboxInputComponent,
    StudentAutocompleteComponent,
    StudentDisplayComponent,
    TimestampPickerComponent,
    TruncatePipe,
    DisplayFieldComponent,
    FocusDirective,
    NotificationComponent
  ],
  providers: [DataService, ProgressService, StudentService, NotificationService],
  entryComponents: [NotificationComponent]
})
export class SharedModule {}
