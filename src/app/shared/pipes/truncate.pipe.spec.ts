import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  let pipe: TruncatePipe;

  beforeEach(() => {
    pipe = new TruncatePipe();
  });
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
  it('default parameters truncates a long word', () => {
    expect(pipe.transform('aLongLongLongLongLongLongLongLongWord')).toEqual('aLongLongLongLongLon...');
  });
  it('default parameters truncates a long sentence', () => {
    expect(pipe.transform('a long rambling sentence about nothing in particular')).toEqual('a long rambling sent...');
  });
  it('default parameters does not transform a word shorter than its limit', () => {
    expect(pipe.transform('aShortWord')).toEqual('aShortWord');
  });
  it('truncates with a provided limit', () => {
    expect(pipe.transform('aShortWord', 4)).toEqual('aSho...');
  });
  it('truncates with a provided trail', () => {
    expect(pipe.transform('aShortWord', 4, '!!!!!')).toEqual('aSho!!!!!');
  });
});
