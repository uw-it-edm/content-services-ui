import { PageConfig } from './page-config';
import { Field } from './field';

export class Config {
  appName: string;
  tenant: string;
  contentConfig: ContentConfig;
  pages: Map<string, PageConfig> = new Map<string, PageConfig>();
  customText: Map<string, CustomTextItem>;

  availableFields: Array<Field>;

  /**
   * Warning message to show in the header of the application. See CAB-4228 for details.
   */
  warningHeaderMessage: string;
}

export class ContentConfig {
  profile: string;
  account: string;
}

export class CustomTextItem {
  label: string;
  description: string;
}
