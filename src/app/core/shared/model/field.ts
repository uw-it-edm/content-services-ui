import { CheckboxOptions } from './field/checkbox-options';

export class Field {
  public key: string;
  public label: string;

  public dataType?: string;
  public displayType?: string;

  public options?: any[] = [];
  public filteredOptions?: any = [];

  public checkboxOptions?: CheckboxOptions;

  public sortable?: boolean;
}
