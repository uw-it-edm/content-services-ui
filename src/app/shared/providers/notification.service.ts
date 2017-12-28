import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarVerticalPosition } from '@angular/material';
import { NotificationComponent } from '../widgets/notification/notification.component';
import { isNullOrUndefined } from 'util';

export class NotificationOptions {
  constructor(
    public detailedMessage?: any,
    public duration: number = 0,
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

  error(message: string, options: NotificationOptions = new NotificationOptions()) {
    console.error(isNullOrUndefined(options.detailedMessage) ? message : options.detailedMessage);
    this.openSnackBar(message, NotificationType.ERROR, options);
  }

  info(message: string, options: NotificationOptions = new NotificationOptions()) {
    console.log(isNullOrUndefined(options.detailedMessage) ? message : options.detailedMessage);
    this.openSnackBar(message, NotificationType.INFO, options);
  }

  warn(message: string, options: NotificationOptions = new NotificationOptions()) {
    console.warn(isNullOrUndefined(options.detailedMessage) ? message : options.detailedMessage);
    this.openSnackBar(message, NotificationType.WARN, new NotificationOptions());
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
