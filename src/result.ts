import { CommonResult } from './common-result';
import { Result as ResultType, Ok, Err, SpreadErrors } from './result-helpers';

export { Ok, OkNamespace, Err, ErrNamespace, Result, ResultNamespace };

interface ResultNamespace {
  /**
   * Combine provided Results list into single Result. If all provided Results
   * are Ok Results, returned Result will be Result Ok of array of provided Results values:
   * [Ok<A>, Ok<B>] -> Ok<[A, B]>
   * If provided Results list have at least one Err Result, returned Result will be
   * Result Err of first Err value found in the array.
   * @param results list of Ok and/or Err Results
   * @returns Result Ok of all input Ok values, or Err Result of one of provided Err values.
   */
  combine<T extends readonly ResultType<unknown, unknown>[]>(
    results: [...T]
  ): SpreadErrors<ResultType<ExtractOkTypes<T>, ExtractErrTypes<T>[number]>>;
}

const Result: ResultNamespace = {
  combine(results) {
    const wrappersPromise = Promise.all(results.map((res) => res.__value));
    const resultPromise = wrappersPromise.then((wrappers) => {
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

interface OkNamespace {
  /**
   * Return Ok Result of the provided value
   * @param value the value for which Ok Result should be returned
   * @returns Ok Result of provided value
   */
  of<TValue>(value: TValue): Ok<TValue>;
}

interface ErrNamespace {
  /**
   * Return Err Result of the provided value
   * @param error the error for which Err Result should be returned
   * @returns Err Result of provided error instance
   */
  of<TError>(error: TError): TError extends unknown ? Err<TError> : never;
}

const Ok: OkNamespace = {
  of(value) {
    return CommonResult.ok(value);
  },
};

const Err: ErrNamespace = {
  of(error) {
    return CommonResult.err(error) as any;
  },
};

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
>
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    V extends {} // filter out "unknown" values
    ? V
    : never
  : never;

// need to be separated generic type to run it for every element of union T separately
type ExtractErrFromUnion<
  T extends ResultType<unknown, unknown>
> = T extends Err<infer E>
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    E extends {} // filter out "unknown" values
    ? E
    : never
  : never;
