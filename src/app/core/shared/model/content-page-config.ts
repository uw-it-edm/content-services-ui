import { ButtonConfig } from './button-config';
import { Field } from './field';
import { PageConfig } from './page-config';

export class ContentPageConfig implements PageConfig {
  pageName: string;
  theme: string;
  fieldsToDisplay: Array<Field> = [];
  fieldKeysToDisplay: Array<string> = [];

  viewPanel: boolean;

  /**
   * Whether the 'Upload Another' checkbox should be checked by default on the create page.
   * The checkbox is only displayed on the create page.
   */
  uploadAnother: boolean;
  allowPageByPageMode: boolean;

  onSave: Array<any> = [];
  buttons: Array<ButtonConfig> = [];
}
