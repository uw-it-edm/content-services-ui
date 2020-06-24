import { NgModule } from '@angular/core';
import { FacetsBoxComponent } from './facets-box/facets-box.component';
import { SearchBoxComponent } from './search-box/search-box.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SearchService } from './shared/search.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSortHeaderIntl } from '@angular/material/sort';
import { MaterialConfigModule } from '../routing/material-config.module';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';
import { SearchPageComponent } from './search-page/search-page.component';
import { SearchDaterangePickerComponent } from './search-daterange-picker/search-daterange-picker.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { DisplaySearchPageComponent } from './display-search-page/display-search-page.component';
import { DocumentDisplayerComponent } from './document-displayer/document-displayer.component';

@NgModule({
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialConfigModule,
    NgxDaterangepickerMd.forRoot(),
    UserModule,
  ],
  exports: [SearchPageComponent, DisplaySearchPageComponent, SearchResultsComponent],
  declarations: [
    SearchDaterangePickerComponent,
    SearchPageComponent,
    DisplaySearchPageComponent,
    SearchResultsComponent,
    SearchBoxComponent,
    FacetsBoxComponent,
    DocumentDisplayerComponent,
  ],
  providers: [SearchService, MatSortHeaderIntl],
})
export class SearchModule {}
