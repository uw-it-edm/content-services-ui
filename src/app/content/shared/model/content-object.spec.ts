import { ContentObject } from './content-object';
import { ContentItem } from './content-item';

describe('ContentObject', () => {
  let contentObject: ContentObject;

  function generateContentObject(id: string, label: string, webExtension: string): ContentObject {
    const defaultContentItem = new ContentItem();
    defaultContentItem.id = id;
    defaultContentItem.label = label;
    defaultContentItem.metadata['WebExtension'] = webExtension;
    contentObject = new ContentObject(defaultContentItem);
    return contentObject;
  }

  beforeEach(() => {
    contentObject = generateContentObject('1', 'test label', 'pdf');
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

  it('should have an initialized image dataType for jpg', () => {
    const imageObject = generateContentObject('1', 'test label', 'jpg');
    expect(imageObject.displayType).toEqual('image');
  });
  it('should have an initialized image dataType for jpeg', () => {
    const imageObject = generateContentObject('1', 'test label', 'jpeg');
    expect(imageObject.displayType).toEqual('image');
  });
  it('should have an initialized image dataType for png', () => {
    const imageObject = generateContentObject('1', 'test label', 'png');
    expect(imageObject.displayType).toEqual('image');
  });
  it('should have an initialized image dataType for bmp', () => {
    const imageObject = generateContentObject('1', 'test label', 'bmp');
    expect(imageObject.displayType).toEqual('image');
  });
  it('should have an initialized image dataType for gif', () => {
    const imageObject = generateContentObject('1', 'test label', 'gif');
    expect(imageObject.displayType).toEqual('image');
  });

  it('should have an initialized unknown dataType for yml', () => {
    const unknownObject = generateContentObject('1', 'test label', 'yml');
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
