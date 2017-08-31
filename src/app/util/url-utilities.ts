export class UrlUtilities {
  public static generateUrlParameterString(urlParameters: string[]) {
    let urlParameterString = '';
    if (urlParameters && urlParameters.length > 0) {
      urlParameterString = '?' + urlParameters.join('&');
    }
    return urlParameterString;
  }
}
