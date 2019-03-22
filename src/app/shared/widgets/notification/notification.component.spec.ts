import { NotificationComponent } from './notification.component';

describe('NotificationComponent', () => {
  let component: NotificationComponent;

  it('should create', () => {
    component = new NotificationComponent(null, null);
    expect(component).toBeTruthy();
  });

  it('should set default data values if none provided', () => {
    const data = {
      message: 'test message'
    };
    component = new NotificationComponent(null, data);
    expect(component).toBeTruthy();
    expect(component.message).toBe(data.message);
    expect(component.type).toBe('info');
    expect(component.dismissText).toBe('Dismiss');
  });

  it('should set provided data values', () => {
    const data = {
      message: 'test message',
      type: 'warn',
      dismissText: 'Close'
    };
    component = new NotificationComponent(null, data);
    expect(component).toBeTruthy();
    expect(component.message).toBe(data.message);
    expect(component.type).toBe(data.type);
    expect(component.dismissText).toBe(data.dismissText);
  });
});
