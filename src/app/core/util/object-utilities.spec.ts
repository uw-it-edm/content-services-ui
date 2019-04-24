import { ObjectUtilities } from './object-utilities';

describe('ObjectUtilities', () => {
  const data = { label: 'my-label', metadata: { code: 'my-code' } };
  it('should return a non nested value', () => {
    expect(ObjectUtilities.getNestedObjectFromArrayOfPath(data, ['label'])).toEqual('my-label');
  });

  it('should return a nested value', () => {
    expect(ObjectUtilities.getNestedObjectFromArrayOfPath(data, ['metadata', 'code'])).toEqual('my-code');
  });

  it('should return undefined on unknown fields', () => {
    expect(ObjectUtilities.getNestedObjectFromArrayOfPath(data, ['blw', 'code'])).toBeUndefined();
  });

  it('should return a non nested value', () => {
    expect(ObjectUtilities.getNestedObjectFromStringPath(data, 'label')).toEqual('my-label');
  });

  it('should return a nested value', () => {
    expect(ObjectUtilities.getNestedObjectFromStringPath(data, 'metadata.code')).toEqual('my-code');
  });

  it('should return undefined on unknown fields', () => {
    expect(ObjectUtilities.getNestedObjectFromStringPath(data, 'blw.code')).toBeUndefined();
  });
});
