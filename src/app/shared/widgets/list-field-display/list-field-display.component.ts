import { Component, OnInit, Input } from '@angular/core';
import { DynamicSelectConfig } from '../../../core/shared/model/field/dynamic-select-config';
import { ObjectUtilities } from '../../../core/util/object-utilities';
import { DataApiValue } from '../../shared/model/data-api-value';

const DEFAULT_LABEL_PATH = 'label';
const MAX_ITEMS_TO_SHOW = 3;

class DisplayItem {
  constructor(public displayValue: string, public isValid: boolean = true) {}
}

@Component({
  selector: 'app-list-field-display',
  templateUrl: './list-field-display.component.html',
  styleUrls: ['./list-field-display.component.css'],
})
export class ListFieldDisplayComponent implements OnInit {
  listItems: DisplayItem[] = [];
  tooltip: string;

  @Input() selectConfig: DynamicSelectConfig;
  @Input() values: string[] = [];
  @Input() sourceModel: DataApiValue[] = [];

  get maxItemsToShow(): number {
    return MAX_ITEMS_TO_SHOW;
  }

  constructor() {}

  ngOnInit(): void {
    if (this.sourceModel && !Array.isArray(this.sourceModel)) {
      throw new Error(`Input sourceModel should be an array. Current type: ${typeof this.sourceModel}`);
    }

    this.sourceModel = this.sourceModel || [];
    this.values = this.values || [];

    let displayItems: DisplayItem[];
    if (this.selectConfig) {
      displayItems = this.getDisplayValues(this.selectConfig.labelPath, this.values);
    } else {
      displayItems = this.values.filter((val) => !!val).map((val) => new DisplayItem(val));
    }

    this.listItems = displayItems.slice(0, MAX_ITEMS_TO_SHOW);
    this.tooltip = displayItems.map((item) => item.displayValue).join('\n');
  }

  private getDisplayValues(labelPath: string, values: string[]): DisplayItem[] {
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
