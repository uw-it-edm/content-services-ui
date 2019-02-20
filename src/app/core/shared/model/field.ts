import { CheckboxOptions } from './field/checkbox-options';
import { FieldOption } from './field/field-option';
import { DynamicSelectOptions } from './field/dynamic-select-options';

export class Field {
  public key: string;
  public label: string;

  public required = false;
  public disabled = false;

  public dataType = 'string';
  public displayType?: string;

  public options?: FieldOption[] = [];

  public dynamicSelectOptions: DynamicSelectOptions;

  public filteredOptions?: any = [];

  public checkboxOptions?: CheckboxOptions;

  public sortable?: boolean;
}
