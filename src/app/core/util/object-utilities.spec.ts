import { ObjectUtilities } from './object-utilities';

describe('ObjectUtilities', () => {
  const data = { label: 'my-label', metadata: { code: 'my-code' } };
  it('should return a non nested value', () => {
    expect(ObjectUtilities.getNestedObject(data, ['label'])).toEqual('my-label');
  });

  it('should return a nested value', () => {
    expect(ObjectUtilities.getNestedObject(data, ['metadata', 'code'])).toEqual('my-code');
  });

  it('should return undefined on unknown fields', () => {
    expect(ObjectUtilities.getNestedObject(data, ['blw', 'code'])).toBeUndefined();
  });
});
