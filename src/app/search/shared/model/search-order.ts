export class SearchOrder {
  term: string;
  /**
   * Sets the value when a field is missing in a doc.
   * Can also be set to _last or _first to sort missing last or first respectively.
   */
  missing: string;

  /**
   * asc/desc
   */
  order: string;
}
