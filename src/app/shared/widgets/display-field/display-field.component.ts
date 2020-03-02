import { Component, Input } from '@angular/core';
import { Field } from '../../../core/shared/model/field';

@Component({
  selector: 'app-display-field',
  templateUrl: './display-field.component.html',
  styleUrls: ['./display-field.component.css']
})
export class DisplayFieldComponent {
  @Input() field: Field;
  @Input() value;

  getFieldDisplayType(): string {
    let type = 'default';

    if (this.field && this.field.displayType) {
      if (this.field.displayType === 'select' && this.field.dynamicSelectConfig) {
        type = 'dataApiValue';
      } else {
        type = this.field.displayType;
      }
    }

    return type;
  }
}
