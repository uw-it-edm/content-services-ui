import { Field } from './field';

export interface PageConfig {
  pageName: string;
  theme: string;
  fieldsToDisplay: Array<Field>;
}
