import { ContentObject } from './content-object';
import { ContentItem } from './content-item';

describe('ContentObject', () => {
  let defaultContentItem: ContentItem;
  let contentObject: ContentObject;

  beforeEach(() => {
    defaultContentItem = new ContentItem();
    defaultContentItem.id = '1';
    defaultContentItem.label = 'test label';
    defaultContentItem.metadata['MimeType'] = 'application/pdf';

    contentObject = new ContentObject(defaultContentItem);
  });

  it('should have an identify pdf dataType from dataURI', () => {
    const url = 'data:application/pdf:asdfasdfasdfasdfsad';
    contentObject.determineUrlType(url);
    expect(contentObject.displayType).toEqual('pdf');
  });

  it('should have an identify image dataType from dataURI', () => {
    const url = 'data:image/jpeg:asdfasdfasdfasdfsad';
    contentObject.determineUrlType(url);
    expect(contentObject.displayType).toEqual('image');
  });

  it('should have an identify pdfUrl dataType from url', () => {
    const url = 'http://asdfasdfasdfasdfsad';
    contentObject.determineUrlType(url);
    expect(contentObject.displayType).toEqual('pdfUrl');
  });

  it('should have an identify unkown dataType from dataURI', () => {
    const url = 'data:application/unknown;asdfasdfasdfasdfsad';
    contentObject.determineUrlType(url);
    expect(contentObject.displayType).toEqual('unknown-dataURI');
  });

  it('should have an initialized pdfUrl dataType', () => {
    expect(contentObject.displayType).toEqual('pdfUrl');
  });

  it('should have an initialized image dataType', () => {
    const contentItem2 = new ContentItem();
    contentItem2.id = '2';
    contentItem2.label = 'test label 2';
    contentItem2.metadata['MimeType'] = 'image/jpg';
    const imageObject = new ContentObject(contentItem2);
    expect(imageObject.displayType).toEqual('image');
  });

  it('should have an initialized unknown dataType', () => {
    const contentItem2 = new ContentItem();
    contentItem2.id = '2';
    contentItem2.label = 'test label 2';
    contentItem2.metadata['MimeType'] = 'application/yml';
    const unknownObject = new ContentObject(contentItem2);
    expect(unknownObject.displayType).toEqual('unknown');
  });

  it('should have an initialized unknown dataType when no MimeType is specified', () => {
    const contentItem3 = new ContentItem();
    contentItem3.id = '2';
    contentItem3.label = 'test label 2';
    const unknownObject2 = new ContentObject(contentItem3);
    expect(unknownObject2.displayType).toEqual('unknown');
  });

  it('should initialize variables when file is added', () => {
    const properties = {
      type: 'text/plain'
    };
    const file = new File(['This is a test file'], 'test.txt', properties);

    const co = new ContentObject(null, file);
    expect(co.file).toBe(file);
    expect(co.getOriginalFileName()).toBe('test.txt');
    expect(co.persisted).toBeFalsy();
  });
});
