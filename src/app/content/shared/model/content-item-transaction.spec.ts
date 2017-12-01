import { ContentItemTransaction } from './content-item-transaction';
import { Observable } from 'rxjs/Observable';
import { ContentItem } from './content-item';
import { ContentService } from '../content.service';
import { Config } from '../../../core/shared/model/config';
import { Field } from '../../../core/shared/model/field';
import { User } from '../../../user/shared/user';

class MockContentService extends ContentService {
  constructor() {
    super(null, null, null);
  }
  create(contentItem: ContentItem, file: File): Observable<ContentItem> {
    return Observable.of(contentItem);
  }
  getFileUrl(itemId: string, webViewable: boolean): string {
    return 'testUrl/' + itemId;
  }
}

describe('ContentItemTransaction', () => {
  let mockContentService: ContentService;
  let transaction: ContentItemTransaction;
  const sourceItem: ContentItem = null;
  const config = new Config();
  config.profile = 'testProfile';
  const formModel = {};
  const fields = new Array<Field>();
  const user = new User('testUser');

  beforeEach(() => {
    mockContentService = new MockContentService();
    transaction = new ContentItemTransaction(mockContentService);
  });

  it('should correctly populate the profileId when preparing to save', () => {
    const contentItem = transaction.prepareItem(sourceItem, fields, formModel, config);
    expect(contentItem.metadata['ProfileId']).toBe('testProfile');
  });
  it('should populate the account when preparing to save', () => {
    config.account = 'testAccount';
    const contentItem = transaction.prepareItem(sourceItem, fields, formModel, config, user);
    expect(contentItem.metadata['Account']).toBe('testAccount');
  });
  it('should populate the account replacing user template when preparing to save', () => {
    config.account = 'testAccount/${user}';
    const contentItem = transaction.prepareItem(sourceItem, fields, formModel, config, user);
    expect(contentItem.metadata['Account']).toBe('testAccount/testUser');
  });
  it('should add the specified metadata overrides when preparing to save', () => {
    const metadataOverrides = [
      { name: 'PublishStatus', value: 'Published' },
      { name: 'AnotherOnSave', value: 'Value' }
    ];
    const contentItem = transaction.prepareItem(sourceItem, fields, formModel, config, user, metadataOverrides);
    expect(contentItem.metadata['PublishStatus']).toBe('Published');
    expect(contentItem.metadata['AnotherOnSave']).toBe('Value');
  });
  it('should create a content object with an initialized contentItemUrl', () => {
    const contentItem = new ContentItem();
    contentItem.id = '123';
    const index = transaction.addItem(contentItem);
    const contentObject = transaction.contentObjects[index];
    transaction.onDisplayType(contentObject, 'anyvalue');
    expect(contentObject.url).toBe('testUrl/123');
  });
});
