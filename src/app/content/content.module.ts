import { ContentService } from './shared/content.service';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';
import { EditPageComponent } from './edit-page/edit-page.component';
import { ContentMetadataComponent } from './content-metadata/content-metadata.component';
import { ContentViewComponent } from './content-view/content-view.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ContentPagerComponent } from './content-pager/content-pager.component';
import { CreatePageComponent } from './create-page/create-page.component';
import { DynamicComponentDirective } from './shared/directive/dynamic-component.directive';
import { ContentToolbarComponent } from './content-toolbar/content-toolbar.component';
import { ContentObjectListComponent } from './content-object-list/content-object-list.component';

@NgModule({
  imports: [FormsModule, SharedModule, ReactiveFormsModule, UserModule, PdfViewerModule],
  exports: [],
  declarations: [
    EditPageComponent,
    ContentMetadataComponent,
    ContentObjectListComponent,
    ContentToolbarComponent,
    ContentViewComponent,
    DynamicComponentDirective,
    ContentPagerComponent,
    CreatePageComponent
  ],
  entryComponents: [ContentViewComponent],
  providers: [ContentService]
})
export class ContentModule {}
