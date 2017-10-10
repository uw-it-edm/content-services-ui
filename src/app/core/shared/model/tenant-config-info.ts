export class TenantConfigInfo {
  tenantName: string;
  downloadUrl: string;

  constructor(tenantName: string, downloadUrl: string) {
    this.tenantName = tenantName;
    this.downloadUrl = downloadUrl;
  }
}
