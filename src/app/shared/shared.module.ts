import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HeaderComponent } from './widgets/header/header.component';
import { MaterialConfigModule } from '../routing/material-config.module';
import { RouterModule } from '@angular/router';
import { FileUploadComponent } from './widgets/file-upload/file-upload.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SafeUrl } from '@angular/platform-browser';
import { SafeUrlPipe } from './pipes/safe-url.pipe';

@NgModule({
  imports: [CommonModule, MaterialConfigModule, RouterModule, ReactiveFormsModule],
  exports: [CommonModule, HeaderComponent, MaterialConfigModule, RouterModule, FileUploadComponent, SafeUrlPipe],
  declarations: [HeaderComponent, FileUploadComponent, SafeUrlPipe],
  providers: []
})
export class SharedModule {}
