export class FacetConfig {
  public key: string;

  public label: string;

  public order = 'asc';

  public size = 5;

  public maxSize = 5; // same default value as size for backward compatiblity

  public dataApiValueType: string;

  public dataApiLabelPath: string;
}
