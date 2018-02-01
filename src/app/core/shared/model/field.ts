import { CheckboxOptions } from './field/checkbox-options';
import { FieldOption } from './field/field-option';

export class Field {
  public key: string;
  public label: string;

  public required = false;
  public disabled = false;

  public dataType = 'string';
  public displayType?: string;

  public options?: FieldOption[] = [];
  public filteredOptions?: any = [];

  public checkboxOptions?: CheckboxOptions;

  public sortable?: boolean;
}
