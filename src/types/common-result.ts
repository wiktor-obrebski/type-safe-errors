import type {
  Result,
  Constructor,
  InferOk,
  InferErr,
  Err,
  UnknownError,
  Ok,
} from './result-helpers';

export type { CommonResult, ResultWrapper };

interface CommonResult<TErrorOrValue> {
  readonly __value: Promise<ResultWrapper<TErrorOrValue>>;
  __brand: any;

  map<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: (value: InferOk<U>) => R
  ): Result<
    U extends Ok<unknown> ? InferOk<R> : never,
    InferErr<U> | InferErr<R>
  >;

  mapErr<
    U extends Result<unknown, unknown>,
    R,
    E extends InferErr<U> | UnknownError
  >(
    this: U,
    ErrorClass: Constructor<E>,
    mapper: (err: E) => R
  ): Result<
    InferOk<R>,
    U extends Err<unknown> ? Exclude<InferErr<U>, E> | InferErr<R> : never
  >;

  mapAnyErr<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: (value: InferErr<U>) => R
  ): Result<InferOk<U> | InferOk<R>, InferErr<R>>;

  unsafePromise<U extends Result<unknown, unknown>>(
    this: U
  ): Promise<InferOk<U> | never>;

  /**
   * Return fulfilled promise of current `Ok`` Result value. To use the `promise()`
   * function you need first handle all known `Err`` result values.
   * It is possible that it return rejected promise for unknown exceptions.
   * @returns promise of current Result value - fulfilled if the value is Ok,
   *          rejected if there was an exception thrown anywhere in the mapping chain
   */
  promise<U extends Result<unknown, unknown>>(
    this: U
  ): Promise<InferOk<U> | never>;
}

interface ResultWrapper<TErrorOrValue> {
  value: TErrorOrValue;
  isError: boolean;
}
