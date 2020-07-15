import { Component, OnInit, Input } from '@angular/core';
import { DynamicSelectConfig } from '../../../core/shared/model/field/dynamic-select-config';
import { ObjectUtilities } from '../../../core/util/object-utilities';

const DEFAULT_LABEL_PATH = 'label';

@Component({
  selector: 'app-list-field-display',
  templateUrl: './list-field-display.component.html',
  styleUrls: ['./list-field-display.component.css'],
})
export class ListFieldDisplayComponent implements OnInit {
  displayValues: string[] = [];

  @Input() selectConfig: DynamicSelectConfig;
  @Input() values: string[] = [];
  @Input() sourceModel: { valueId: string; data: { [key: string]: any } }[] = [];

  constructor() {}

  ngOnInit(): void {
    if (this.sourceModel && !Array.isArray(this.sourceModel)) {
      throw new Error(`Input sourceModel should be an array. Current type: ${typeof this.sourceModel}`);
    }

    this.sourceModel = this.sourceModel || [];
    this.values = this.values || [];

    if (this.selectConfig) {
      this.displayValues = this.getDisplayValues(this.values.slice(0, 3));
    } else {
      this.displayValues = this.values.filter((val) => !!val).slice(0, 3);
    }
  }

  private getDisplayValues(values: string[]): string[] {
    const displayPath = (this.selectConfig && this.selectConfig.labelPath) || DEFAULT_LABEL_PATH;

    return values.map((value) => {
      const valueSourceModel = this.sourceModel.find((sourceModel) => sourceModel.valueId === value);

      if (valueSourceModel) {
        return ObjectUtilities.getNestedObjectFromStringPath(valueSourceModel.data, displayPath);
      }

      return null;
    });
  }
}
