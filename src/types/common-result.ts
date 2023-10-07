import type {
  Result,
  Constructor,
  MapOkResult,
  InferOk,
  ErrMapper,
  MapErrResult,
  MapAnyErrResult,
  InferErr,
  Err,
  UnknownError,
} from './result-helpers';

export type { CommonResult, ResultWrapper };

interface CommonResult<TErrorOrValue> {
  readonly __value: Promise<ResultWrapper<TErrorOrValue>>;
  __brand: any;

  map<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: (value: InferOk<U>) => R | Promise<R>
  ): MapOkResult<U, R>;

  mapErr<
    U extends Result<unknown, unknown>,
    R extends {},
    E extends InferErr<U> | UnknownError
  >(
    this: U,
    ErrorClass: Constructor<E>,
    mapper: (err: E) => R | Promise<R>
  ): MapErrResult<U, R, E>;

  mapAnyErr<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: ErrMapper<U | Err<UnknownError>, R>
  ): MapAnyErrResult<U, R>;

  unsafePromise<U extends Result<unknown, unknown>>(
    this: U
  ): Promise<InferOk<U> | never>;

  /**
   * Return fulfilled promise of current `Ok` Result value. To use the `promise()`
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
