import { ButtonConfig } from './button-config';

export class EditPageConfig {
  pageName: string;
  viewPanel: boolean;

  buttons: Array<ButtonConfig> = [];
  fieldsToDisplay: Array<string> = [];
}
