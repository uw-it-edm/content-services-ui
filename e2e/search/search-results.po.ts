import { promise, by, ElementFinder, ElementArrayFinder, protractor } from 'protractor';
import { BrowserUtils } from '../browserUtils';

/**
 * Page object to interact with the SearchResultsComponent.
 */
export class SearchResultsPageObject {
  private utils = new BrowserUtils;
  private root: ElementFinder;

  /**
   * Creates a new instance of page object.
   * @param root Root element of component to anchors all internal searches.
   */
  constructor(root: ElementFinder) {
    this.root = root;
  }

  /**
   * Gets the rows of the results table.
   */
  get rows(): ElementArrayFinder {
    return this.root.all(by.css('app-search-results .mat-row'));
  }

  /**
   * Gets the values of each row cell of a given column.
   * @param column Text of the column to get all its row values for.
   */
  getResultsByColumn(column: string): promise.Promise<string[]> {
    const selector = '.mat-cell.mat-column-' + column;

    // ElementArrayFinder.getText() has incorrect return type. See https://github.com/angular/protractor/issues/3818
    return <any>this.root.all(by.css(selector)).getText();
  }

  /**
   * Gets a distinct set of values all row cells of a given column.
   * @param column Text of the column to get row values for.
   */
  getDistinctResultsByColumn(column: string): promise.Promise<string[]> {
    return this.getResultsByColumn(column).then((results) => {
      return Array.from(new Set(results));
    });
  }

  /**
   * Sorts results by the column header with the text specified.
   * @param headerText The text of the column to sort the results by.
   */
  sortByHeaderText(headerText: string): promise.Promise<any> {
    const header = this.root.element(by.buttonText(headerText));
    return header.click();
  }

  /**
   * Selects rows specified by index.
   * @param indices Array of row indices to select.
   */
  selectRows(...indices: number[]): promise.Promise<any> {
    const checkboxes = this.root.all(by.css('.mat-row .mat-checkbox-inner-container'));

    indices.sort((a,b) => b - a);

    return checkboxes.count().then(count => {
      if (indices[0] > count - 1) {
        throw new Error(`Not enough rows to select all indices. Row count: ${count}, indices: ${indices}`);
      }

      const promises: promise.Promise<any>[] = [];

      checkboxes.each((checkbox, index) => {
        if (indices.includes(index)) {
          promises.push(checkbox.click());
        }
      });

      return protractor.promise.all(promises);
    });
  }

  /**
   * Waits until the results table has the expected number of rows.
   * @param expectedCount Number of rows expected.
   * @param timeoutMilliseconds Time out in milliseconds.
   */
  waitForRowCount(expectedCount: number, timeoutMilliseconds: number = 5000): promise.Promise<any> {
    return this.utils.waitForFunc(
      () => this.rows.count(),
      count => count === expectedCount,
      timeoutMilliseconds
    ).then(() => expect(this.rows.count()).toEqual(expectedCount));
  }

  /**
   * Waits for the first row of a given column to have the expected text.
   * @param columnId The identifier of the column to test.
   * @param expectedText The expected text of the first row of column.
   * @param timeoutMilliseconds Timeout in milliseconds to wait for.
   */
  waitForFirstRowValue(
    columnId: string,
    expectedText: string,
    timeoutMilliseconds: number = 5000
  ): promise.Promise<any> {
    return this.utils.waitForFunc(
      () => this.getResultsByColumn(columnId),
      (rows) => rows && rows.length > 0 && rows[0].trim() === expectedText,
      timeoutMilliseconds
    ).then(() => expect(this.getDistinctResultsByColumn(columnId).then((rows) => rows[0])).toEqual(expectedText));
  }
}
