export class ObjectUtilities {
  private static splitRegex = /[.]/g;

  /**
   * Get a nested object based on a array of keys
   *
   * ex:
   *    let data = {"metadata":{"key":"value"}}
   *    getNestedObject(data, ['metadata','key'])
   * will return 'value'
   *
   * @param nestedObj
   * @param pathArr
   * @param defaultValue Optional, let you define a default value if the key doesn't exist
   */

  public static getNestedObjectFromArrayOfPath(nestedObj: any, pathArr: string[], defaultValue?: string) {
    return pathArr.reduce(
      (obj, key) => (obj && obj[key] !== 'undefined' ? obj[key] : this.getDefaultOrUndefined(defaultValue)),
      nestedObj
    );
  }

  private static getDefaultOrUndefined(defaultValue: string) {
    return defaultValue === undefined ? undefined : defaultValue;
  }

  /**
   * Get a nested object based on path
   *
   * ex:
   *    let data = {"metadata":{"key":"value"}}
   *    getNestedObject(data, 'metadata.key'])
   * will return 'value'
   *
   * @param nestedObj
   * @param pathArr
   * @param defaultValue Optional, let you define a default value if the key doesn't exist
   */
  public static getNestedObjectFromStringPath(nestedObj: any, path: string, defaultValue?: string) {
    return this.getNestedObjectFromArrayOfPath(nestedObj, path.split(this.splitRegex), defaultValue);
  }
}
