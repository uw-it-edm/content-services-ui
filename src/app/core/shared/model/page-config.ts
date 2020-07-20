import { Field } from './field';

export interface PageConfig {
  pageName: string;
  theme: string;
  fieldsToDisplay: Array<Field>;
  fieldKeysToDisplay: Array<string>;

  /**
   * Specifies values to override when using field references.
   */
  fieldOverrides?: { key: string; overrides: Object }[];
}
