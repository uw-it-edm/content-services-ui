import { publishReplay } from 'rxjs/operators';
/**
 *
 * From: https://stackoverflow.com/a/43879433
 *
 * Decorator that replays and connects to the Observable returned from the function.
 * Caches the result using all arguments to form a key.
 * @param target
 * @param name
 * @param descriptor
 * @returns {PropertyDescriptor}
 */
import { Observable } from 'rxjs';

export function CacheObservableDecorator(target: Object, name: string, descriptor: PropertyDescriptor) {
  const originalFunc = descriptor.value;
  const cacheMap = new Map<string, any>();

  descriptor.value = function(this: any, ...args: any[]): any {
    const key = args.join('::');

    let returnValue = cacheMap.get(key);
    if (returnValue !== undefined) {
      // console.log(`${name} cache-hit ${key}`, returnValue);
      return returnValue;
    }

    returnValue = originalFunc.apply(this, args);
    // console.log(`${name} cache-miss ${key} new`, returnValue);

    if (returnValue instanceof Observable) {
      returnValue = returnValue.pipe(publishReplay(1));
      returnValue.connect();
    } else {
      console.warn('CacheObservableDecorator: value not an Observable cannot publishReplay and connect', returnValue);
    }

    cacheMap.set(key, returnValue);
    return returnValue;
  };

  return descriptor;
}
