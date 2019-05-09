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
   */

  public static getNestedObjectFromArrayOfPath(nestedObj: any, pathArr: string[]) {
    return pathArr.reduce((obj, key) => (obj && obj[key] !== 'undefined' ? obj[key] : undefined), nestedObj);
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
   */
  public static getNestedObjectFromStringPath(nestedObj: any, path: string) {
    return this.getNestedObjectFromArrayOfPath(nestedObj, path.split(this.splitRegex));
  }
}
