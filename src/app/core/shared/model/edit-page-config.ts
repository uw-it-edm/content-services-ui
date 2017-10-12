import { ButtonConfig } from './button-config';
import { Field } from './field';

export class EditPageConfig {
  pageName: string;
  theme: string;
  viewPanel: boolean;

  buttons: Array<ButtonConfig> = [];
  fieldsToDisplay: Array<Field> = [];
}
