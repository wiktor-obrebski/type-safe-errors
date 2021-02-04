import { ExtractOkTypes, ExtractErrTypes } from './combine.d';
import { ResultWrapper } from './result-wrapper';
import { CommonResult } from './common-result';
import {
  OkMapper,
  MapOkResult,
  ErrMapper,
  MapErrResult,
  InferErr,
  AClass
} from './result.d';

export { Ok, Err, Result };

type Result<TValue, TError> = Ok<TValue> | Err<TError>;

interface Ok<TValue> {
  readonly __value: Promise<ResultWrapper<TValue>>;

  __brand: 'ok';

  map<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: OkMapper<U, R>
  ): MapOkResult<U, R>;

  mapErr<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: ErrMapper<U, R>
  ): MapErrResult<U, R>;
}

interface Err<TError> {
  readonly __value: Promise<ResultWrapper<TError>>;

  __brand: 'err';

  map<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: OkMapper<U, R>
  ): MapOkResult<U, R>;

  mapErr<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: ErrMapper<U, R>
  ): MapErrResult<U, R>;

  handle<U extends Result<unknown, unknown>, R, E extends InferErr<U>>(
    this: U,
    ErrorClass: AClass<E>,
    handler: (err: E) => R
  ): U;
}

const Result = {
  combine<T extends readonly Result<unknown, unknown>[]>(
    results: [...T]
  ): Result<ExtractOkTypes<T>, ExtractErrTypes<T>[number]> {
    const wrappersPromise = Promise.all(results.map(res => res.__value));
    const resultPromise = wrappersPromise.then(wrappers => {
      const values = [];
      for (const wrapper of wrappers) {
        if (wrapper.isError) {
          return { ...wrapper } as any;
        } else {
          values.push(wrapper.value);
        }
      }
      return { isError: false, value: values };
    });

    return CommonResult.__fromValueWrapper(resultPromise);
  },
};

const Ok = {
  of<TValue>(value: TValue) {
    return CommonResult.ok(value);
  },
};

const Err = {
  of<TError>(error: TError) {
    return CommonResult.err(error);
  },
};
