import { PageConfig } from './page-config';

export class Config {
  appName: string;
  tenant: string;
  profile: string;
  account: string;
  pages: Map<string, PageConfig> = new Map<string, PageConfig>();
  customText: Map<string, CustomTextItem>;
}

export class CustomTextItem {
  label: string;
  description: string;
}
