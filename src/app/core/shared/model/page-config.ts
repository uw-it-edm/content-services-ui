import { Field, FieldReference } from './field';

export interface PageConfig {
  pageName: string;
  theme: string;
  fieldsToDisplay: Array<Field>;
  fieldKeysToDisplay: Array<string>;

  /**
   * A list of field references to display (identified by the 'key' in the availableFields list).
   */
  fieldReferencesToDisplay?: FieldReference[];
}
