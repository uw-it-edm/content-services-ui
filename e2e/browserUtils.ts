import { promise, browser, by, element, ElementFinder, ExpectedConditions } from 'protractor';

/**
 * Generic utility methods to interact with the browser.
 */
export class BrowserUtils {
  /**
   * Dismisses a browser's alert pop up.
   * @param isAlertUnexpected Whether an alert is expected.
   */
  clickAcceptAlert(isAlertUnexpected: boolean = false) {
    browser
      .switchTo()
      .alert()
      .then((alert) => {
        if (isAlertUnexpected) {
          console.log('WARN: Unexpected alert left open from previous test. ');
        }
        alert.accept();
      });
  }

  /**
   * Waits for the browser's active element to be the one with the given id.
   * @param expectedElementId Expected id of the active element.
   * @param timeoutMilliseconds Timeout in milliseconds to wait for.
   */
  waitForActiveElement(expectedElementId: string, timeoutMilliseconds: number = 5000): promise.Promise<any> {
    const getActiveElementIdFunc = () => browser.driver.switchTo().activeElement().getAttribute('id');

    return this.waitForFunc(
      () => getActiveElementIdFunc(),
      (actualId) => actualId === expectedElementId,
      timeoutMilliseconds
    ).then(() => expect(getActiveElementIdFunc()).toBe(expectedElementId));
  }

  /**
   * Waits for a snack bar to show with the given text.
   * @param expectedText expected text to be contained in snack bar message.
   * @param timeoutMilliseconds Timeout in milliseconds to wait for.
   * @param timeoutMilliseconds Timeout in milliseconds to wait for.
   */
  waitForSnackBarText(expectedText: string, timeoutMilliseconds: number = 5000): promise.Promise<any> {
    const supplierFunc = () => element(by.className('mat-simple-snackbar'));

    const visiblePromise = browser.wait(
      ExpectedConditions.visibilityOf(supplierFunc()),
      timeoutMilliseconds,
      `SnackBar was not visible after ${timeoutMilliseconds} ms.`
    );

    return visiblePromise.then(() => {
      return this.waitForFunc(
        () => supplierFunc().getText(),
        (text) => (text || '').indexOf(expectedText) >= 0,
        timeoutMilliseconds
      ).then(() => expect(supplierFunc().getText()).toContain(expectedText));
    });
  }

  /**
   * Waits for an element to contain the given text.
   * @param elementOrSelector Element or selector to locate the element to test.
   * @param expectedText Expected text.
   * @param timeoutMilliseconds Timeout in milliseconds to wait for.
   */
  waitForElementText(
    elementOrSelector: string | ElementFinder,
    expectedText: string,
    timeoutMilliseconds: number = 5000
  ): promise.Promise<any> {
    const getElementFinder = () => (typeof elementOrSelector !== 'string' ? elementOrSelector : element(by.css(elementOrSelector)));
    return this.waitForFunc(
      () => getElementFinder().getText(),
      (text) => (text || '').indexOf(expectedText) >= 0,
      timeoutMilliseconds
    ).then(() => expect(getElementFinder().getText()).toContain(expectedText));
  }

  /**
   * Waits for a value retrieved by a supplier function to pass a check whithin a given timeout.
   *   The reason for this function is for timeout errors to report meaningful error message with the last current value displayed.
   * @param supplierFunc Function that supplies the value to test.
   * @param predicate Checks whether the supplied value passes the test.
   * @param timeoutMilliseconds Timeout in milliseconds to wait for.
   */
  waitForFunc<T>(
    supplierFunc: () => promise.Promise<T>,
    predicate: (val: T) => boolean,
    timeoutMilliseconds: number = 5000
  ): promise.Promise<any> {
    const startTime = new Date();

    const checkFunc = () => {
      return () =>
        supplierFunc().then((currentVal) => {
          const currentTime = new Date();
          const timeDiff = <any>currentTime - <any>startTime;
          return timeDiff >= timeoutMilliseconds || predicate(currentVal);
        });
    };

    return browser.wait(checkFunc());
  }
}
