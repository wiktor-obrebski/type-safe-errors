import { CommonResult } from './common-result';
import { ResultWrapper } from './result-wrapper';
import {
  Result as ResultType, AClass,
  Ok, OkMapper, MapOkResult,
  Err, ErrMapper, MapErrResult, MapAnyErrResult, InferErr
} from './result-helpers';

export { Ok, Err, Result, CombineResult };

type CombineResult<T extends readonly ResultType<unknown, unknown>[]> =
  ResultType<ExtractOkTypes<T>, ExtractErrTypes<T>[number]>;

const Result = {
  combine<T extends readonly ResultType<unknown, unknown>[]>(
    results: [...T]
  ): CombineResult<T> {
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

type FilterOk<U extends ResultType<unknown, unknown>> = U extends Ok<unknown>
  ? U
  : never;

// Given a list of Results, this extracts all the different `T` types from that list
type ExtractOkTypes<T extends readonly ResultType<unknown, unknown>[]> = {
  [Key in keyof T]: T[Key] extends ResultType<unknown, unknown>
    ? ExtractOkFromUnion<T[Key]>
    : never;
};

// Given a list of Results, this extracts all the different `E` types from that list
type ExtractErrTypes<T extends readonly ResultType<unknown, unknown>[]> = {
  [Key in keyof T]: T[Key] extends ResultType<unknown, unknown>
    ? ExtractErrFromUnion<T[Key]>
    : never;
};

// need to be separated generic type to run it for every element of union T separately
type ExtractOkFromUnion<T extends ResultType<unknown, unknown>> = T extends Ok<
  infer V
> // filter out "unknown" values
  ? V extends {}
    ? V
    : never
  : never;

// need to be separated generic type to run it for every element of union T separately
type ExtractErrFromUnion<T extends ResultType<unknown, unknown>> = T extends Err<
  infer E
> // filter out "unknown" values
  ? E extends {}
    ? E
    : never
  : never;
