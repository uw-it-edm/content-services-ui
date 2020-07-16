/**
 * Configuration settings for filter-select fields.
 */
export interface FilterSelectConfig {
  /**
   * Whether to enable multiple selection of options.
   */
  enableMultipleSelection?: boolean;

  /**
   * The maximum number of selections allowed when multiple selection is enabled, infinite if not defined.
   */
  maximumSelectionCount?: number;
}
