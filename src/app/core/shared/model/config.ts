import { PageConfig } from './page-config';

export class Config {
  appName: string;
  tenant: string;
  pages: Map<string, PageConfig> = new Map<string, PageConfig>();
}
