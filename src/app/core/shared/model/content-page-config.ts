import { ButtonConfig } from './button-config';
import { Field } from './field';

export class ContentPageConfig {
  pageName: string;
  theme: string;
  viewPanel: boolean;

  uploadAnother: boolean;
  onSave: Array<any> = [];

  buttons: Array<ButtonConfig> = [];
  fieldsToDisplay: Array<Field> = [];
}
