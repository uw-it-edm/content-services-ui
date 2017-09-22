import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HeaderComponent } from './widgets/header/header.component';
import { MaterialConfigModule } from '../routing/material-config.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, MaterialConfigModule, RouterModule],
  exports: [CommonModule, HeaderComponent, MaterialConfigModule, RouterModule],
  declarations: [HeaderComponent],
  providers: []
})
export class SharedModule {}
