import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarVerticalPosition } from '@angular/material';
import { NotificationComponent } from '../widgets/notification/notification.component';
import { isNullOrUndefined } from 'util';

export class NotificationOptions {
  constructor(
    public duration: number = 4000,
    public ariaLiveMessage?: string,
    public dismissText: string = 'Dismiss',
    public verticalPosition: MatSnackBarVerticalPosition = 'top'
  ) {}
}

export class NotificationType {
  public static ERROR = 'error';
  public static INFO = 'info';
  public static WARN = 'warn';
}

@Injectable()
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  error(message: string, detailedMessage?: any, options: NotificationOptions = new NotificationOptions()) {
    console.error(isNullOrUndefined(detailedMessage) ? message : detailedMessage);
    this.openSnackBar(message, NotificationType.ERROR, options);
  }

  info(message: string, detailedMessage?: any, options: NotificationOptions = new NotificationOptions(2000)) {
    console.log(isNullOrUndefined(detailedMessage) ? message : detailedMessage);
    this.openSnackBar(message, NotificationType.INFO, options);
  }

  warn(message: string, detailedMessage?: any, options: NotificationOptions = new NotificationOptions()) {
    console.warn(isNullOrUndefined(detailedMessage) ? message : detailedMessage);
    this.openSnackBar(message, NotificationType.WARN, options);
  }

  private openSnackBar(message: string, type: string, options: NotificationOptions) {
    const config = new MatSnackBarConfig();
    config.verticalPosition = options.verticalPosition;
    config.duration = options.duration;
    config.announcementMessage = isNullOrUndefined(options.ariaLiveMessage) ? message : options.ariaLiveMessage;
    config.data = {
      message: message,
      type: type,
      dismissText: options.dismissText
    };

    this.snackBar.openFromComponent(NotificationComponent, config);
  }
}
