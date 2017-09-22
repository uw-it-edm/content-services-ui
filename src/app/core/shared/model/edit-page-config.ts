import { ButtonConfig } from './button-config';

export class EditPageConfig {
  pageName: string;
  theme: string;
  viewPanel: boolean;

  buttons: Array<ButtonConfig> = [];
  fieldsToDisplay: Array<string> = [];
}
