import { Component, OnInit, Input } from '@angular/core';
import { DynamicSelectConfig } from '../../../core/shared/model/field/dynamic-select-config';
import { ObjectUtilities } from '../../../core/util/object-utilities';
import { DataApiValue } from '../../shared/model/data-api-value';

const DEFAULT_LABEL_PATH = 'label';

class DisplayValue {
  constructor(public displayValue: string, public isValid: boolean = true) {}
}

@Component({
  selector: 'app-list-field-display',
  templateUrl: './list-field-display.component.html',
  styleUrls: ['./list-field-display.component.css'],
})
export class ListFieldDisplayComponent implements OnInit {
  listItems: DisplayValue[] = [];

  @Input() selectConfig: DynamicSelectConfig;
  @Input() values: string[] = [];
  @Input() sourceModel: DataApiValue[] = [];

  constructor() {}

  ngOnInit(): void {
    if (this.sourceModel && !Array.isArray(this.sourceModel)) {
      throw new Error(`Input sourceModel should be an array. Current type: ${typeof this.sourceModel}`);
    }

    this.sourceModel = this.sourceModel || [];
    this.values = this.values || [];

    if (!this.selectConfig) {
      this.listItems = this.values
        .filter((val) => !!val)
        .slice(0, 3)
        .map((val) => new DisplayValue(val));
    } else {
      this.listItems = this.getDisplayValues(this.selectConfig.labelPath, this.values.slice(0, 3));
    }
  }

  private getDisplayValues(labelPath: string, values: string[]): DisplayValue[] {
    labelPath = labelPath || DEFAULT_LABEL_PATH;

    return values.map((value) => {
      const valueSourceModel = this.sourceModel.find((sourceModel) => sourceModel.valueId === value);
      const sourceModelData = valueSourceModel && valueSourceModel.data;
      const displayValue = ObjectUtilities.getNestedObjectFromStringPath(sourceModelData, labelPath);

      return {
        displayValue: displayValue || value,
        isValid: !!displayValue,
      };
    });
  }
}
