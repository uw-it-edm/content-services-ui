import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FieldOption } from '../../core/shared/model/field/field-option';
import { DynamicSelectConfig } from '../../core/shared/model/field/dynamic-select-config';
import { ParentFieldConfig } from '../../core/shared/model/field/parent-field-config';
import { DataApiValueSearchResults } from '../shared/model/data-api-value-search-results';
import { DataApiValue } from '../shared/model/data-api-value';
import { ObjectUtilities } from '../../core/util/object-utilities';
import { DataApiValueService } from './dataapivalue.service';
import { Field } from '../../core/shared/model/field';

/**
 * Refactors common code used by OptionsInputComponent and OptionsAutocompleteComponent.
 */
@Injectable()
export class FieldOptionService {

  constructor(private dataApiValueService: DataApiValueService) {}

  public getFieldOptions(fieldConfig: Field, parentValue?: any): Observable<FieldOption[]> {
    const dynamicSelectConfig = fieldConfig.dynamicSelectConfig;
    const parentFieldConfig = dynamicSelectConfig && dynamicSelectConfig.parentFieldConfig;
    let allOptions: Observable<FieldOption[]>;

    if (!dynamicSelectConfig) {
      allOptions = of(
        fieldConfig.options.map((option) => {
          return Object.assign(new FieldOption(), option);
        })
      );
    } else if (!parentFieldConfig) {
      allOptions = this.dataApiValueService.listByType(dynamicSelectConfig.type).pipe(
        map((results: DataApiValueSearchResults) => results.content),
        map((values: DataApiValue[]) => {
          return values.map((value: DataApiValue) => {
            return this.dataApiValuesToFieldOption(dynamicSelectConfig, value);
          });
        })
      );
    } else if (parentValue) {
      allOptions = this.getOptionsFromParent(dynamicSelectConfig, parentFieldConfig, parentValue);
    } else {
      allOptions = of([]);
    }

    return allOptions;
  }

  public getOptionsFromParent(
    dynamicSelectConfig: DynamicSelectConfig,
    parentFieldConfig: ParentFieldConfig,
    newParentValue: any
  ): Observable<FieldOption[]> {
    return this.dataApiValueService
      .listByTypeAndParent(dynamicSelectConfig.type, parentFieldConfig.parentType, newParentValue)
      .pipe(
        map((results: DataApiValueSearchResults) => results.content),
        map((values: DataApiValue[]) => {
          return values.map((value: DataApiValue) => {
            return this.dataApiValuesToFieldOption(dynamicSelectConfig, value);
          });
        })
      );
  }

  private dataApiValuesToFieldOption(dynamicSelectConfig: DynamicSelectConfig, value: DataApiValue): FieldOption {
    const displayValue = ObjectUtilities.getNestedObjectFromStringPath(value.data, dynamicSelectConfig.labelPath);
    return new FieldOption(value.valueId, displayValue);
  }
}
