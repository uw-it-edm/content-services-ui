import { UrlUtilities } from './url-utilities';

describe('UrlUtilities', () => {
  it('should generate a Url parameter string', () => {
    const urlParameters: string[] = [];
    urlParameters.push('rendition=Web');
    urlParameters.push('test=abcd');
    expect(UrlUtilities.generateUrlParameterString(urlParameters)).toEqual('?rendition=Web&test=abcd');
  });

  it('should generate an empty Url parameter string', () => {
    const urlParameters: string[] = [];
    expect(UrlUtilities.generateUrlParameterString(urlParameters)).toEqual('');
  });
});
