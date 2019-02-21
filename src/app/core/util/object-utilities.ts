export class ObjectUtilities {
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
  public static getNestedObject(nestedObj: any, pathArr: string[]) {
    return pathArr.reduce((obj, key) => (obj && obj[key] !== 'undefined' ? obj[key] : undefined), nestedObj);
  }
}
