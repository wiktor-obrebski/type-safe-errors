import { expect } from 'chai';
import { Result } from '../types/result-helpers';

export {
  shouldEventuallyOk,
  shouldEventuallyErr,
  shouldEventuallyReject,
  shouldBeAssignable,
};

async function shouldEventuallyOk<TValue>(
  result: Result<unknown, unknown>,
  value: TValue,
  done: (err?: any) => void
): Promise<void> {
  const wrapper = await result.__value;

  if (wrapper.isError) {
    done(`Ok result expected (${value}), got Err result`);
  } else {
    try {
      expect(wrapper.value).to.deep.equal(value);
      done();
    } catch (err) {
      done(err);
    }
  }
}

async function shouldEventuallyErr<TValue>(
  result: Result<unknown, unknown>,
  value: TValue,
  done: (err?: any) => void
): Promise<void> {
  const wrapper = await result.__value;

  if (wrapper.isError) {
    try {
      expect(wrapper.value).to.equal(value);
      done();
    } catch (err) {
      done(err);
    }
  } else {
    done(`Err result expected (${value}), got Ok result`);
  }
}

async function shouldEventuallyReject<TValue>(
  result: Result<unknown, unknown>,
  value: TValue,
  done: (err?: any) => void
): Promise<void> {
  try {
    await result.unsafePromise();
    done(`Reject promise result expected (${value}), but promise resolve`);
  } catch (err) {
    done();
  }
}

/**
 * Check if two values are compatible, can `value` be assigned to `to`.
 *
 * Most of the time we can verify the type of an operation by providing
 * an explicit expected type, e.g.
 *
 * ```ts
 * const action = () => 1
 * const actual: string = action()
 * ```
 *
 * The test will fail type checks, because `number` cannot be assigned to `string`.
 * However, when the expected type is a superset of the returned type, e.g.
 *
 * ```ts
 * const actual: string | number = action()
 * ```
 *
 * Such a test won't ensure that `action()` returns exactly `string | number`,
 * since `number` can be assigned to `string | number`.
 *
 * Instead we can infer the `actual` value and check if we can assign all
 * our expected types to it.
 *
 * ```ts
 * const actual = action()
 *
 * shouldBeAssignable(actual, 2)  // pass
 * shouldBeAssignable(actual, "") // fail, string cannot be assigned to number
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
function shouldBeAssignable<T>(_to: T, _value: T) {}
