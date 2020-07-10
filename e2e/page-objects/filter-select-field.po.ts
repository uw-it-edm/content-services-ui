import { promise, by, ElementArrayFinder, browser, ExpectedConditions, element, ElementFinder } from 'protractor';
import { BrowserUtils } from '../browserUtils';

const utils = new BrowserUtils();

/**
 * Page object to interact with a form field that contains a OptionsAutocompleteComponent.
 */
export class FilterSelectFieldPageObject {
  /**
   * Creates a new instance of page object.
   */
  constructor(public root: ElementFinder) {}

  /**
   * Removes a selected option by index.
   */
  removeOptionAt(index: number): promise.Promise<any> {
    utils
      .waitForFunc(
        () => this.selectedOptions.count(),
        (count) => index < count,
        5000
      )
      .then(() => expect(this.selectedOptions.count()).toBeGreaterThan(index, 'Not enough selected options.'));

    const removeButton = this.selectedOptions.get(index).element(by.tagName('mat-icon'));
    browser.wait(
      ExpectedConditions.elementToBeClickable(removeButton),
      5000,
      `Selected option at index '${index}' is not clickable.`
    );

    return removeButton.click();
  }

  /**
   * Adds an option to the selected list with the given index.
   */
  addOptionAt(index: number): promise.Promise<any> {
    this.root.element(by.className('mat-input-element')).click();

    utils
      .waitForFunc(
        () => this.options.count(),
        (count) => index < count,
        5000
      )
      .then(() => expect(this.options.count()).toBeGreaterThan(index, 'Not enough available options.'));

    browser.wait(
      ExpectedConditions.elementToBeClickable(this.options.get(index)),
      5000,
      `Available option at index ${index} is not clickable.`
    );

    return this.options.get(index).click();
  }

  /**
   * Gets the selected options display text.
   */
  getSelectedValues(): promise.Promise<string[]> {
    // ElementArrayFinder.getText() has incorrect return type. See https://github.com/angular/protractor/issues/3818
    return this.selectedOptions
      .getText()
      .then((result: any) => (<string[]>result).map((val) => val.replace('cancel', '').trim()));
  }

  /**
   * Gets the dropdown options.
   */
  get options(): ElementArrayFinder {
    return element.all(by.className('mat-option'));
  }

  /**
   * Gets the selected option chips.
   */
  get selectedOptions(): ElementArrayFinder {
    return this.root.all(by.tagName('mat-chip'));
  }

  /**
   * Waits until the selected options list to have the expected count.
   */
  waitForSelectionCount(expectedCount: number, timeoutMilliseconds: number = 5000): promise.Promise<any> {
    return utils
      .waitForFunc(
        () => this.selectedOptions.count(),
        (count) => count === expectedCount,
        timeoutMilliseconds
      )
      .then(() => expect(this.selectedOptions.count()).toEqual(expectedCount));
  }
}
