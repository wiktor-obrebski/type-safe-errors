import type { Ok, Err, InferOk, InferErr, Result } from './result-helpers';

export type { ResultNamespace, OkNamespace, ErrNamespace };

type Combine<Results extends readonly unknown[]> = Result<
  { -readonly [P in keyof Results]: InferOk<Results[P]> },
  InferErr<Results[number]>
>;

interface ResultNamespace {
  from<R>(
    factory: () => R | Promise<R>
  ): R extends Result<unknown, unknown> ? R : Result<InferOk<R>, InferErr<R>>;

  /**
   * Combine provided Results list into single Result. If all provided Results
   * are Ok Results, returned Result will be Result Ok of array of provided Results values:
   * [Ok<A>, Ok<B>] -> Ok<[A, B]>
   * If provided Results list have at least one Err Result, returned Result will be
   * Result Err of first Err value found in the array.
   * @param results list of Ok and/or Err Results
   * @returns Result Ok of all input Ok values, or Err Result of one of provided Err values.
   */
  combine<
    T extends readonly (
      | Result<unknown, unknown>
      | Promise<Result<unknown, unknown>>
    )[]
  >(
    results: [...T]
  ): Combine<T>;
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
