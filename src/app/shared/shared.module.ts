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
import { FocusModule } from 'angular2-focus/src/focus.module';
import { CheckboxInputComponent } from './widgets/checkbox/checkbox-input.component';

@NgModule({
  imports: [CommonModule, MaterialConfigModule, RouterModule, ReactiveFormsModule, FocusModule.forRoot()],
  exports: [
    CommonModule,
    CustomTextDirective,
    HeaderComponent,
    MaterialConfigModule,
    RouterModule,
    FileUploadComponent,
    SafeUrlPipe,
    CheckboxInputComponent
  ],
  declarations: [CustomTextDirective, HeaderComponent, FileUploadComponent, SafeUrlPipe, CheckboxInputComponent],
  providers: [DataService]
})
export class SharedModule {}
