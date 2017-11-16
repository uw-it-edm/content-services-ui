import { ContentService } from './shared/content.service';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';
import { EditPageComponent } from './edit-page/edit-page.component';
import { ContentMetadataComponent } from './content-metadata/content-metadata.component';
import { ContentViewComponent } from './content-view/content-view.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ContentPagerComponent } from './content-pager/content-pager.component';
import { CreatePageComponent } from './create-page/create-page.component';

@NgModule({
  imports: [SharedModule, ReactiveFormsModule, UserModule, PdfViewerModule],
  exports: [EditPageComponent],
  declarations: [
    EditPageComponent,
    ContentMetadataComponent,
    ContentViewComponent,
    ContentPagerComponent,
    CreatePageComponent
  ],
  providers: [ContentService]
})
export class ContentModule {}
