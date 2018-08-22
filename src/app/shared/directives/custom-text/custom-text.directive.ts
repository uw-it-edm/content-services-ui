import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';
import { CustomTextItem } from '../../../core/shared/model/config';
import { ConfigResolver } from '../../../routing/shared/config-resolver.service';
import { isNullOrUndefined } from 'util';

@Directive({ selector: '[appCustomText]' })
export class CustomTextDirective implements OnChanges {
  @Input() appCustomText: string;
  @Input() defaultValue: string;

  customText: Map<string, CustomTextItem>;

  constructor(private configResolver: ConfigResolver, private renderer: Renderer2, private el: ElementRef) {
    this.configResolver.getCustomTextSubject().subscribe(customText => {
      this.customText = customText;
      this.setCustomText(this.customText, this.appCustomText, this.defaultValue);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !isNullOrUndefined(changes.appCustomText) &&
      !isNullOrUndefined(changes.appCustomText.currentValue) &&
      !isNullOrUndefined(changes.defaultValue) &&
      !isNullOrUndefined(changes.defaultValue.currentValue)
    ) {
      this.setCustomText(this.customText, changes.appCustomText.currentValue, changes.defaultValue.currentValue);
    }
  }

  private setCustomText(customText: Map<string, CustomTextItem>, id: string, defaultValue: string) {
    if (!isNullOrUndefined(customText)) {
      if (!isNullOrUndefined(id)) {
        const customTextItem = customText[id];
        let description;
        let label;
        if (isNullOrUndefined(customTextItem)) {
          label = this.defaultValue;
        } else {
          description = customTextItem.description;
          label = customTextItem.label;
        }
        if (!this.el.nativeElement.classList.contains('custom-text-rendered')) {
          const text = this.renderer.createText(label);
          this.renderer.addClass(this.el.nativeElement, 'custom-text-rendered');
          this.renderer.setAttribute(this.el.nativeElement, 'title', description);
          this.renderer.appendChild(this.el.nativeElement, text);
        }
      } else if (!isNullOrUndefined(defaultValue)) {
        const defaultText = this.renderer.createText(defaultValue);
        this.renderer.addClass(this.el.nativeElement, 'default-text-rendered');
        this.renderer.appendChild(this.el.nativeElement, defaultText);
      }
    }
  }
}
