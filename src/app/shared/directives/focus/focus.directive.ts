import { AfterContentChecked, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appFocus]'
})
export class FocusDirective implements AfterContentChecked {
  private element: HTMLElement;
  private hasFocused = false;

  @Input() appFocus: boolean;

  constructor(element: ElementRef) {
    this.element = element.nativeElement;
  }

  ngAfterContentChecked() {
    this.giveFocus();
  }

  giveFocus() {
    if (this.appFocus && !this.hasFocused) {
      this.element.focus();
      this.hasFocused = true;
    }
  }
}
