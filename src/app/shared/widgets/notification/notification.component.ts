import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material';
import { isNullOrUndefined } from '../../../core/util/node-utilities';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements AfterViewInit {
  message: string;
  type: string; // error, warning, info
  dismissText: string;
  @ViewChild('dismissNotificationButton', { static: true }) dismissNotificationButton;

  constructor(public snackBarRef: MatSnackBarRef<NotificationComponent>, @Inject(MAT_SNACK_BAR_DATA) public data: any) {
    if (!isNullOrUndefined(data)) {
      this.message = data.message;
      this.type = isNullOrUndefined(data.type) ? 'info' : data.type;
      this.dismissText = isNullOrUndefined(data.dismissText) ? 'Dismiss' : data.dismissText;
    }
  }

  ngAfterViewInit() {
    this.dismissNotificationButton.focus();
  }

  public onDismiss() {
    this.snackBarRef.dismiss();
  }
}
