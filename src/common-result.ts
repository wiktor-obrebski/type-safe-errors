import { Result, Ok, Err } from './result';
import {
  OkMapper,
  MapOkResult,
  ErrMapper,
  MapErrResult,
  InferErr,
  AClass,
} from './result.d';
import { ResultWrapper } from './result-wrapper';

export class CommonResult<TErrorOrValue>
  implements Ok<TErrorOrValue>, Err<TErrorOrValue> {
  readonly __value: Promise<ResultWrapper<TErrorOrValue>>;
  __brand: any;

  private constructor(value: Promise<ResultWrapper<TErrorOrValue>>) {
    this.__value = value;
  }

  private static fromValue<TErrorOrValue>(
    isError: boolean,
    value: TErrorOrValue
  ) {
    const wrapper = new ResultWrapper(value, isError);
    return new CommonResult(Promise.resolve(wrapper));
  }

  static __fromValueWrapper<TErrorOrValue>(
    wrapper: Promise<ResultWrapper<TErrorOrValue>>
  ) {
    return new CommonResult(wrapper);
  }

  static ok<TValue>(value: TValue): Ok<TValue> {
    return CommonResult.fromValue(false, value);
  }

  static err<TError>(error: TError): Err<TError> {
    return CommonResult.fromValue(true, error);
  }

  map<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: OkMapper<U, R>
  ): MapOkResult<U, R> {
    const newValWrapperPromise = getResultWrapper<TErrorOrValue>(this).then(
      async wrapper => {
        if (wrapper.isError) {
          return wrapper;
        }

        const newValue = await mapper(wrapper.value as any);
        if (isResult(newValue)) {
          return getResultWrapper(newValue);
        } else {
          return new ResultWrapper(newValue, false);
        }
      }
    );
    return new CommonResult(newValWrapperPromise) as any;
  }

  mapErr<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: ErrMapper<U, R>
  ): MapErrResult<U, R> {
    const newValWrapperPromise = getResultWrapper<TErrorOrValue>(this)
      .then(wrapper =>
        wrapper.isError ? mapper(wrapper.value as any) : wrapper.value
      )
      .then(newValue => {
        if (isResult(newValue)) {
          return getResultWrapper(newValue);
        } else {
          return new ResultWrapper(newValue, true);
        }
      });
    return new CommonResult(newValWrapperPromise) as any;
  }

  handle<U extends Result<unknown, unknown>, R, E extends InferErr<U>>(
    this: U,
    ErrorClass: AClass<E>,
    handler: (err: E) => R
  ): U {
    const newResultPromise = getResultWrapper<TErrorOrValue>(this).then(
      wrapper => {
        if (wrapper.isError && wrapper.value instanceof ErrorClass) {
          handler(wrapper.value as any);
        }
        return { ...wrapper } as any;
      }
    );
    return new CommonResult(newResultPromise) as any;
  }

  promise(): Promise<TErrorOrValue | never> {
    return getResultWrapper<TErrorOrValue>(this).then(wrapper =>
      wrapper.isError
        ? Promise.reject(wrapper.value)
        : Promise.resolve(wrapper.value)
    );
  }
}

function getResultWrapper<TErrorOrValue>(result: Result<unknown, unknown>) {
  return ((result as unknown) as CommonResult<TErrorOrValue>).__value;
}

function isResult(value: unknown): value is Result<unknown, unknown> {
  return value instanceof CommonResult;
}
