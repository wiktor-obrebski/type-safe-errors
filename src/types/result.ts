import type {
  Result as ResultType,
  Ok,
  Err,
  SpreadErrors,
  MapFromResult,
  SimpleAwaited,
} from './result-helpers';

export type { ResultNamespace, OkNamespace, ErrNamespace };

type AnyResult = ResultType<unknown, unknown>;

interface ResultNamespace {
  from<R>(factory: () => R): MapFromResult<R>;

  /**
   * Combine provided Results list into single Result. If all provided Results
   * are Ok Results, returned Result will be Result Ok of array of provided Results values:
   * [Ok<A>, Ok<B>] -> Ok<[A, B]>
   * If provided Results list have at least one Err Result, returned Result will be
   * Result Err of first Err value found in the array.
   * @param results list of Ok and/or Err Results
   * @returns Result Ok of all input Ok values, or Err Result of one of provided Err values.
   */
  combine<T extends readonly unknown[]>(
    results: [...T]
  ): SpreadErrors<ResultType<ExtractOkTypes<T>, ExtractErrTypes<T>[number]>>;
}

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

// Given a list of Results, this infer all the different `Ok` types from that list
type ExtractOkTypes<T extends readonly unknown[]> = {
  [Key in keyof T]: ExtractOkFromUnion<SimpleAwaited<T[Key]>>;
};

// Given a list of Results, this infer all the different `Err` types from that list
type ExtractErrTypes<T extends readonly unknown[]> = {
  [Key in keyof T]: ExtractErrFromUnion<SimpleAwaited<T[Key]>>;
};

// need to be separated generic type to run it for every element of union T separately
type ExtractOkFromUnion<T> = T extends Err<unknown>
  ? never
  : T extends Ok<infer V>
  ? V
  : T;

// need to be separated generic type to run it for every element of union T separately
type ExtractErrFromUnion<T> = T extends Err<infer E>
  ? E
  : never;
