import { promise, by, ElementArrayFinder, browser, ExpectedConditions, element, ElementFinder } from 'protractor';
import { BrowserUtils } from '../browserUtils';

const utils = new BrowserUtils;

/**
 * Page object to interact with a form field that contains a OptionsInputComponent.
 */
export class SelectFieldPageObject {
  /**
   * Creates a new instance of page object.
   */
  constructor(public root: ElementFinder) { }

  /**
   * Gets the element for the OptionsInputComponent.
   */
  get optionsInputElement(): ElementFinder {
    return this.root.element(by.tagName('app-options-input'));
  }

  /**
   * Selects the option with the given index.
   */
  selectValue(index: number): promise.Promise<any> {
    this.optionsInputElement.click();

    utils.waitForFunc(
      () => this.getOptions().count(),
      count => count > 0,
      5000
    ).then(() => expect(this.getOptions().count()).toBeGreaterThan(0, 'mat-options count'));

    browser.wait(
      ExpectedConditions.elementToBeClickable(this.getOptions().get(index)),
      5000,
      `Option with index ${index} is not clickable.`);

    return this.getOptions().get(index).click();
  }

  /**
   * Gets the selected text.
   */
  getSelectedValue(): promise.Promise<string> {
    return this.root.element(by.className('mat-select-value-text')).getText();
  }

  /**
   * Gets all the dropdown options.
   */
  getOptions(): ElementArrayFinder {
    return element.all(by.className('mat-option'));
  }
}
