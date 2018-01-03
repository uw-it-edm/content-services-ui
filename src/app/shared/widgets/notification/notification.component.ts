import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent {
  message: string;
  type: string; // error, warning, info
  dismissText: string;

  constructor(public snackBarRef: MatSnackBarRef<NotificationComponent>, @Inject(MAT_SNACK_BAR_DATA) public data: any) {
    if (!isNullOrUndefined(data)) {
      this.message = data.message;
      this.type = isNullOrUndefined(data.type) ? 'info' : data.type;
      this.dismissText = isNullOrUndefined(data.dismissText) ? 'Dismiss' : data.dismissText;
    }
  }

  public onDismiss() {
    this.snackBarRef.dismiss();
  }
}
