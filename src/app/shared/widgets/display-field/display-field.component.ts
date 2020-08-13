import { Component, Input } from '@angular/core';
import { Field, isFieldRightAligned } from '../../../core/shared/model/field';

@Component({
  selector: 'app-display-field',
  templateUrl: './display-field.component.html',
  styleUrls: ['./display-field.component.css'],
})
export class DisplayFieldComponent {
  @Input() field: Field;
  @Input() value;
  @Input() sourceModel: { [key: string]: any };

  getFieldDisplayType(): string {
    let type = 'default';

    if (this.field && this.field.displayType) {
      if (this.field.displayType === 'multi-select') {
        type = 'listValue';
      } else if (!this.field.dynamicSelectConfig) {
        type = this.field.displayType;
      } else if (this.field.displayType === 'select' || this.field.displayType === 'filter-select') {
        type = 'dataApiValue';
      }
    }

    return type;
  }

  get isRightAligned(): boolean {
    return isFieldRightAligned(this.field);
  }
}
