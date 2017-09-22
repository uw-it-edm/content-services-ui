import { ContentService } from './shared/content.service';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';
import { EditPageComponent } from './edit-page/edit-page.component';
import { ContentMetadataComponent } from './content-metadata/content-metadata.component';
import { ContentViewComponent } from './content-view/content-view.component';
import { MaterialConfigModule } from '../routing/material-config.module';

@NgModule({
  imports: [SharedModule, ReactiveFormsModule, UserModule, MaterialConfigModule],
  exports: [EditPageComponent],
  declarations: [EditPageComponent, ContentMetadataComponent, ContentViewComponent],
  providers: [ContentService]
})
export class ContentModule {}
