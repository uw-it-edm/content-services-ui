import { isNullOrUndefined, isUndefined } from './node-utilities';

describe('isNullOrUndefined', () => {
  it('return true on null', () => {
    const value = null;
    expect(isNullOrUndefined(value)).toBeTruthy();
  });
  it('return true on undefined', () => {
    const value = undefined;
    expect(isNullOrUndefined(value)).toBeTruthy();
  });

  it('return false on string', () => {
    const value = 'not true';
    expect(isNullOrUndefined(value)).toBeFalsy();
  });
  it('return false on empty string', () => {
    const value = '';
    expect(isNullOrUndefined(value)).toBeFalsy();
  });
  it('return false on number', () => {
    const value = 1;
    expect(isNullOrUndefined(value)).toBeFalsy();
  });
  it('return false on negative number', () => {
    const value = -1;
    expect(isNullOrUndefined(value)).toBeFalsy();
  });
});

describe('isUndefined', () => {
  it('return false on null', () => {
    const value = null;
    expect(isUndefined(value)).toBeFalsy();
  });
  it('return true on undefined', () => {
    const value = undefined;
    expect(isUndefined(value)).toBeTruthy();
  });

  it('return false on string', () => {
    const value = 'not true';
    expect(isUndefined(value)).toBeFalsy();
  });
  it('return false on empty string', () => {
    const value = '';
    expect(isUndefined(value)).toBeFalsy();
  });
  it('return false on number', () => {
    const value = 1;
    expect(isUndefined(value)).toBeFalsy();
  });
  it('return false on negative number', () => {
    const value = -1;
    expect(isUndefined(value)).toBeFalsy();
  });
});
