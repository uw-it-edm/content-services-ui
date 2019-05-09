import { ButtonConfig } from './button-config';
import { Field } from './field';
import { PageConfig } from './page-config';

export class ContentPageConfig implements PageConfig {
  pageName: string;
  theme: string;
  fieldsToDisplay: Array<Field> = [];
  fieldKeysToDisplay: Array<string> = [];

  viewPanel: boolean;
  uploadAnother: boolean;
  allowPageByPageMode: boolean;

  onSave: Array<any> = [];
  buttons: Array<ButtonConfig> = [];
}
