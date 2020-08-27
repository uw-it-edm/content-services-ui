import { by, ElementArrayFinder, browser, ExpectedConditions, ElementFinder } from 'protractor';
import { SelectFieldPageObject } from './select-field.po';
import { MultiSelectFieldPageObject } from './multi-select-field.po';
import { PersonAutocompleteFieldPageObject } from './person-autocomplete-field.po';

/**
 * Page object to interact with the ContentMetadataComponent.
 */
export class ContentMetadataPageObject {
  /**
   * Creates a new instance of page object.
   */
  constructor(public rootFinder: ElementFinder) {}

  /**
   * Gets all the input elements.
   */
  get inputElements(): ElementArrayFinder {
    return this.rootFinder.all(by.css('.mat-input-element'));
  }

  /**
   * Gets the form field with the given label.
   * @param label Label of the form field to locate.
   */
  getFormField(label: string): ElementFinder {
    // XPath: Find element with tag 'mat-form-field' that has a descendant element with tag 'span'
    //  and specified inner text.
    const field = this.rootFinder.element(by.xpath(`//mat-form-field[.//span[text()='${label}']]`));

    browser.wait(ExpectedConditions.presenceOf(field), 5000, `Unable to locate field with label '${label}'`);

    return field;
  }

  /**
   * Gets a page object to interact with the form field with the given label.
   * @param label Label of the form field to locate.
   * @param pageObject Page object type.
   */
  getFormFieldOf<T>(label: string, pageObject: new (element: ElementFinder) => T): T {
    const field = this.getFormField(label);
    return new pageObject(field);
  }

  /**
   * Gets a page object to interact with a select field with the given label.
   * @param label Label of the form field to locate.
   */
  getSelectFormField(label: string): SelectFieldPageObject {
    return this.getFormFieldOf<SelectFieldPageObject>(label, SelectFieldPageObject);
  }

  /**
   * Gets a page object to interact with a multi select field with the given label.
   * @param label Label of the form field to locate.
   */
  getMultiSelectFormField(label: string): MultiSelectFieldPageObject {
    return this.getFormFieldOf<MultiSelectFieldPageObject>(label, MultiSelectFieldPageObject);
  }

  /**
   * Gets a page object to interact with a person or student autocomplete field with the given label.
   * @param label Label of the form field to locate.
   */
  getPersonAutocompleteFormField(label: string): PersonAutocompleteFieldPageObject {
    return this.getFormFieldOf<PersonAutocompleteFieldPageObject>(label, PersonAutocompleteFieldPageObject);
  }
}
