import { CheckboxOptions } from './field/checkbox-options';
import { FieldOption } from './field/field-option';
import { DynamicSelectConfig } from './field/dynamic-select-config';
import { CourseConfig } from './field/course-config';

export type FieldDataType = 'string' | 'number' | 'date' ;
export type FieldDisplayType = 'date' | 'dateTime' | 'currency' | 'student' | 'person' | 'select';

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
}
