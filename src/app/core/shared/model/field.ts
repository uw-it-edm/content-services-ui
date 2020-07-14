import { CheckboxOptions } from './field/checkbox-options';
import { FieldOption } from './field/field-option';
import { DynamicSelectConfig } from './field/dynamic-select-config';
import { CourseConfig } from './field/course-config';
import { MultiSelectConfig } from './multi-select-config';

export type FieldDataType = 'string' | 'number' | 'date';
export type FieldDisplayType =
  | 'date'
  | 'dateTime'
  | 'number'
  | 'currency'
  | 'student'
  | 'person'
  | 'select'
  | 'filter-select'
  | 'multi-select';

export const isFieldRightAligned = (field: Field): boolean => {
  const displayType = field && field.displayType;

  return displayType && (displayType === 'currency' || displayType === 'number' || displayType === 'date' || displayType === 'dateTime');
};

export class Field {
  public key: string;
  public label: string;

  public required = false;
  public disabled = false;

  /**
   * The native type of the field value.
   */
  public dataType: FieldDataType = 'string';

  /**
   * Controls the way that the field value is displayed.
   */
  public displayType?: FieldDisplayType;

  public options?: FieldOption[] = [];

  public dynamicSelectConfig?: DynamicSelectConfig;

  public filteredOptions?: any = [];

  public checkboxOptions?: CheckboxOptions;

  public sortable?: boolean;

  public courseConfig?: CourseConfig;

  /**
   * Configuration settings for field of type 'multi-select'.
   */
  public multiSelectConfig?: MultiSelectConfig;
}
