import { promise, by, ElementArrayFinder, browser, ExpectedConditions, element, ElementFinder } from 'protractor';
import { BrowserUtils } from '../browserUtils';

const utils = new BrowserUtils();

/**
 * Page object to interact with a form field that contains a PersonAutocompleteComponent.
 */
export class PersonAutocompleteFieldPageObject {
  /**
   * Creates a new instance of page object.
   */
  constructor(public root: ElementFinder) {}

  /**
   * Types a search term in textbox.
   */
  search(term: string): promise.Promise<void> {
    return this.inputElement.sendKeys(term);
  }

  /**
   * Gets the selected value.
   */
  getSelectedValue(): promise.Promise<string> {
    return this.inputElement.getAttribute('value');
  }

  /**
   * Gets the dropdown options.
   */
  get options(): ElementArrayFinder {
    return element.all(by.className('mat-option'));
  }

  /**
   * Waits until the dropdown options list to have the expected count.
   */
  waitForOptionCount(expectedCount: number, timeoutMilliseconds: number = 5000): promise.Promise<any> {
    return utils
      .waitForFunc(
        () => this.options.count(),
        (count) => count === expectedCount,
        timeoutMilliseconds
      )
      .then(() => expect(this.options.count()).toEqual(expectedCount));
  }

  private get inputElement(): ElementFinder {
    return this.root.element(by.tagName('input'));
  }
}
