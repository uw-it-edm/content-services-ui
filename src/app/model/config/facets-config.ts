import { FacetConfig } from './facet-config';
export class FacetsConfig {
  public active = false;

  public facets: Map<string, FacetConfig> = new Map<string, FacetConfig>();
}
