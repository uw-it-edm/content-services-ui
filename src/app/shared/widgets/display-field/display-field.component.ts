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

  constructor() {}

  getFieldType(): string {
    let type = 'default';

    if (this.field) {
      if (this.field.displayType === 'date') {
        type = 'date';
      } else if (this.field.displayType === 'dateTime') {
        type = 'dateTime';
      } else if (this.field.displayType === 'student') {
        type = 'student';
      } else if (this.field.displayType === 'person') {
        type = 'person';
      } else if (this.field.displayType === 'select' && this.field.dynamicSelectConfig) {
        type = 'dataApiValue';
      }
    }

    return type;
  }
}
