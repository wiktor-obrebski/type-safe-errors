import {
  Result,
  AClass,
  Ok,
  OkMapper,
  MapOkResult,
  InferOk,
  Err,
  ErrMapper,
  MapErrResult,
  MapAnyErrResult,
  InferErr,
} from './result-helpers';
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
      async (wrapper) => {
        if (wrapper.isError) {
          return wrapper;
        }

        try {
          const newValue = await mapper(wrapper.value as any);
          if (isResult(newValue)) {
            return getResultWrapper(newValue);
          } else {
            return new ResultWrapper(newValue, false);
          }
        } catch (err: unknown) {
          return new ResultWrapper(err, true);
        }
      }
    );
    return new CommonResult(newValWrapperPromise) as any;
  }

  mapAnyErr<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: ErrMapper<U, R>
  ): MapAnyErrResult<U, R> {
    const newValWrapperPromise = getResultWrapper<TErrorOrValue>(this).then(
      async (wrapper) => {
        if (!wrapper.isError) {
          return wrapper;
        }

        try {
          const newValue = await mapper(wrapper.value as any);
          if (isResult(newValue)) {
            return getResultWrapper(newValue);
          } else {
            return new ResultWrapper(newValue, true);
          }
        } catch (err: unknown) {
          return new ResultWrapper(err, true);
        }
      }
    );
    return new CommonResult(newValWrapperPromise) as any;
  }

  mapErr<U extends Result<unknown, unknown>, R, E extends InferErr<U>>(
    this: U,
    ErrorClass: AClass<E>,
    mapper: (err: E) => R
  ): MapErrResult<U, R, E> {
    const newValWrapperPromise = getResultWrapper<TErrorOrValue>(this).then(
      async (wrapper) => {
        if (!(wrapper.isError && wrapper.value instanceof ErrorClass)) {
          return wrapper;
        }

        try {
          const newValue = await mapper(wrapper.value as any);
          if (isResult(newValue)) {
            return getResultWrapper(newValue);
          } else {
            return new ResultWrapper(newValue, true);
          }
        } catch (err: unknown) {
          return new ResultWrapper(err, true);
        }
      }
    );
    return new CommonResult(newValWrapperPromise) as any;
  }

  promise<U extends Result<unknown, unknown>>(
    this: U
  ): Promise<InferOk<U> | never> {
    return getResultWrapper(this).then((wrapper) =>
      wrapper.isError
        ? Promise.reject(wrapper.value)
        : Promise.resolve(wrapper.value as InferOk<U>)
    );
  }
}

function getResultWrapper<TErrorOrValue>(result: Result<unknown, unknown>) {
  return ((result as unknown) as CommonResult<TErrorOrValue>).__value;
}

function isResult(value: unknown): value is Result<unknown, unknown> {
  return value instanceof CommonResult;
}
