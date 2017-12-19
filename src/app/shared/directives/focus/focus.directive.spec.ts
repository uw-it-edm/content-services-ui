import { FocusDirective } from './focus.directive';
import { ElementRef } from '@angular/core';

describe('FocusDirective', () => {
  let directive: FocusDirective;
  let element;
  beforeEach(function() {
    element = { nativeElement: jasmine.createSpyObj('nativeElement', ['focus']) };
    directive = new FocusDirective(<ElementRef>element);
  });

  it('gives focus on focus is true', function() {
    directive.appFocus = true;
    directive.giveFocus();
    expect(element.nativeElement.focus).toHaveBeenCalled();
  });

  it('does not gives focus on focus is false', function() {
    directive.appFocus = false;
    directive.giveFocus();
    expect(element.nativeElement.focus).not.toHaveBeenCalled();
  });

  it('do not give give focus if it has been called.', function() {
    directive.appFocus = true;
    directive.giveFocus();
    expect(element.nativeElement.focus).toHaveBeenCalledTimes(1);
    directive.giveFocus();
    expect(element.nativeElement.focus).toHaveBeenCalledTimes(1);
  });
});
