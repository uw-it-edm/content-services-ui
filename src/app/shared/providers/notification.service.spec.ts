import { NotificationOptions, NotificationService } from './notification.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import Spy = jasmine.Spy;

let notificationService: NotificationService;
let snackBar: MatSnackBar;
let snackBarSpy: Spy;

describe('NotificationService', () => {
  beforeEach(() => {
    snackBar = new MatSnackBar(null, null, null, null, null);
    notificationService = new NotificationService(snackBar);
    snackBarSpy = spyOn(snackBar, 'openFromComponent');
  });

  it('should be created', () => {
    expect(notificationService).toBeTruthy();
  });

  it('should set default options', () => {
    const message = 'testMessage';
    const type = 'error';

    const defaultNotificationOptions = new NotificationOptions();

    const expectedSnackBarConfig = <MatSnackBarConfig>{
      verticalPosition: defaultNotificationOptions.verticalPosition,
      duration: defaultNotificationOptions.duration,
      announcementMessage: message,
      data: {
        message: message,
        type: type,
        dismissText: defaultNotificationOptions.dismissText
      }
    };

    notificationService.error(message);

    expect(snackBarSpy).toHaveBeenCalledTimes(1);
    const actualSnackBarConfig: MatSnackBarConfig = snackBarSpy.calls.first().args[1];
    expect(actualSnackBarConfig.verticalPosition).toBe(expectedSnackBarConfig.verticalPosition);
    expect(actualSnackBarConfig.duration).toBe(expectedSnackBarConfig.duration);
    expect(actualSnackBarConfig.announcementMessage).toBe(expectedSnackBarConfig.announcementMessage);
    expect(actualSnackBarConfig.data.message).toBe(expectedSnackBarConfig.data.message);
    expect(actualSnackBarConfig.data.type).toBe(expectedSnackBarConfig.data.type);
    expect(actualSnackBarConfig.data.dismissText).toBe(expectedSnackBarConfig.data.dismissText);
  });

  it('should override default options', () => {
    const options = new NotificationOptions();
    options.verticalPosition = 'bottom';
    options.ariaLiveMessage = 'live message';
    options.dismissText = 'Close';
    options.duration = 0;

    notificationService.warn('testMessage', 'a long error message to be logged to the console.', options);

    expect(snackBarSpy).toHaveBeenCalledTimes(1);
    const actualSnackBarConfig: MatSnackBarConfig = snackBarSpy.calls.first().args[1];
    expect(actualSnackBarConfig.verticalPosition).toBe(options.verticalPosition);
    expect(actualSnackBarConfig.duration).toBe(options.duration);
    expect(actualSnackBarConfig.announcementMessage).toBe(options.ariaLiveMessage);
    expect(actualSnackBarConfig.data.dismissText).toBe(options.dismissText);
  });

  it('should be set type to warn', () => {
    notificationService.warn('testMessage');

    const actualSnackBarConfig: MatSnackBarConfig = snackBarSpy.calls.first().args[1];
    expect(actualSnackBarConfig.data.type).toBe('warn');
  });
  it('should be set type to error', () => {
    notificationService.error('testMessage');

    const actualSnackBarConfig: MatSnackBarConfig = snackBarSpy.calls.first().args[1];
    expect(actualSnackBarConfig.data.type).toBe('error');
  });
  it('should be set type to info', () => {
    notificationService.info('testMessage');

    const actualSnackBarConfig: MatSnackBarConfig = snackBarSpy.calls.first().args[1];
    expect(actualSnackBarConfig.data.type).toBe('info');
  });
});
