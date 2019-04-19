import { CheckboxOptions } from './field/checkbox-options';
import { FieldOption } from './field/field-option';
import { DynamicSelectConfig } from './field/dynamic-select-config';

export class Field {
  public key: string;
  public label: string;

  public required = false;
  public disabled = false;

  public dataType = 'string';
  public displayType?: string;

  public options?: FieldOption[] = [];

  public dynamicSelectConfig?: DynamicSelectConfig;

  public filteredOptions?: any = [];

  public checkboxOptions?: CheckboxOptions;

  public sortable?: boolean;
}
