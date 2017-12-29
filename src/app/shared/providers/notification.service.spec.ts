import { NotificationOptions, NotificationService } from './notification.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';

let notificationService: NotificationService;
let snackBar: MatSnackBar;

describe('NotificationService', () => {
  beforeEach(() => {
    snackBar = new MatSnackBar(null, null, null, null);
    notificationService = new NotificationService(snackBar);
  });

  it('should be created', () => {
    expect(notificationService).toBeTruthy();
  });

  it('should set default options', () => {
    const message = 'testMessage';
    const type = 'warn';

    const expectedSnackBarConfig = <MatSnackBarConfig>{
      verticalPosition: 'top',
      duration: 5000,
      announcementMessage: message,
      data: {
        message: message,
        type: type,
        dismissText: 'Dismiss'
      }
    };

    const spy = spyOn(snackBar, 'openFromComponent');
    notificationService.warn(message);

    expect(spy).toHaveBeenCalledTimes(1);
    const actualSnackBarConfig: MatSnackBarConfig = spy.calls.first().args[1];
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
    options.detailedMessage = 'a longer error message';
    options.dismissText = 'Close';
    options.duration = 0;

    const spy = spyOn(snackBar, 'openFromComponent');
    notificationService.warn('testMessage', options);

    expect(spy).toHaveBeenCalledTimes(1);
    const actualSnackBarConfig: MatSnackBarConfig = spy.calls.first().args[1];
    expect(actualSnackBarConfig.verticalPosition).toBe(options.verticalPosition);
    expect(actualSnackBarConfig.duration).toBe(options.duration);
    expect(actualSnackBarConfig.announcementMessage).toBe(options.ariaLiveMessage);
    expect(actualSnackBarConfig.data.dismissText).toBe(options.dismissText);
  });

  it('should be set type to warn', () => {
    const spy = spyOn(snackBar, 'openFromComponent');
    notificationService.warn('testMessage');

    const actualSnackBarConfig: MatSnackBarConfig = spy.calls.first().args[1];
    expect(actualSnackBarConfig.data.type).toBe('warn');
  });
  it('should be set type to error', () => {
    const spy = spyOn(snackBar, 'openFromComponent');
    notificationService.error('testMessage');

    const actualSnackBarConfig: MatSnackBarConfig = spy.calls.first().args[1];
    expect(actualSnackBarConfig.data.type).toBe('error');
  });
  it('should be set type to info', () => {
    const spy = spyOn(snackBar, 'openFromComponent');
    notificationService.info('testMessage');

    const actualSnackBarConfig: MatSnackBarConfig = spy.calls.first().args[1];
    expect(actualSnackBarConfig.data.type).toBe('info');
  });
});
