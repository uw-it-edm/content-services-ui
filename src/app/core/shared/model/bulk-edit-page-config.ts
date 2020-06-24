import { Field } from './field';
import { PageConfig } from './page-config';

export class BulkEditPageConfig implements PageConfig {
  pageName: string;
  theme: string;
  fieldsToDisplay: Array<Field> = [];
  fieldKeysToDisplay: Array<string> = [];

  /**
   * Fields to display on the results table of the bulk edit page.
   */
  resultsTableFieldsToDisplay: Array<Field> = [];

  /**
   * List of keys used to reference fields from the 'availableFields' collection to display
   *   on the results table. If defined, will take precedence over 'resultsTableFieldsToDisplay'.
   */
  resultsTableFieldKeysToDisplay: Array<string> = [];
}
