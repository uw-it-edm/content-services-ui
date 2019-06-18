import { Observable } from 'rxjs';

import { ComponentCanDeactivate } from './component-can-deactivate';
import { CanDeactivate } from '@angular/router';
import { Injectable, OnInit } from '@angular/core';
import { ConfigResolver } from './config-resolver.service';
import { first } from 'rxjs/operators';
import { CustomTextUtilities } from '../../shared/directives/custom-text/custom-text-utilities';
import { CustomTextItem } from '../../core/shared/model/config';

@Injectable()
export class PendingChangesGuard implements CanDeactivate<ComponentCanDeactivate> {
  private unsavedChangesMessage;
  private customText: Map<string, CustomTextItem>;

  constructor(private configResolver: ConfigResolver) {
    this.init();
  }

  canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
    if (component.canDeactivate()) {
      return true;
    } else {
      return confirm(this.unsavedChangesMessage.label);
    }
  }

  init(): void {
    this.configResolver
      .getCustomTextSubject()
      .pipe(first())
      .subscribe(customText => {
        this.customText = customText;
      });
    const defaultText =
      'You have unsaved changes. Press Cancel to go back and save these changes, or OK and your changes will be lost.';
    this.unsavedChangesMessage = CustomTextUtilities.getCustomText(
      this.customText,
      'unsavedChangesMessage',
      defaultText
    );
  }
}
