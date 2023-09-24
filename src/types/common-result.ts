import type {
  Result,
  Constructor,
  OkMapper,
  MapOkResult,
  InferOk,
  ErrMapper,
  MapErrResult,
  MapAnyErrResult,
  InferErr,
  SpreadErrors,
  Err,
  UnknownError,
} from './result-helpers';

export type { CommonResult, ResultWrapper };

interface CommonResult<TErrorOrValue> {
  readonly __value: Promise<ResultWrapper<TErrorOrValue>>;
  __brand: any;

  map<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: OkMapper<U, R>
  ): SpreadErrors<MapOkResult<SpreadErrors<U>, R>>;

  mapErr<
    U extends Result<unknown, unknown>,
    R,
    E extends InferErr<U> | UnknownError
  >(
    this: U,
    ErrorClass: Constructor<E>,
    mapper: (err: E) => R
  ): SpreadErrors<MapErrResult<SpreadErrors<U>, R, E>>;

  mapAnyErr<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: ErrMapper<U | Err<UnknownError>, R>
  ): SpreadErrors<MapAnyErrResult<SpreadErrors<U>, R>>;

  unsafePromise<U extends Result<unknown, unknown>>(
    this: U
  ): Promise<InferOk<U> | never>;

  /**
   * Return fulfilled promise of current `Ok`` Result value. To use the `promise()`
   * function you need first handle all known `Err`` result values.
   * It is possible that it return rejected promise for unknown exceptions.
   * @returns promise of current Result value - fulfilled if the value is Ok,
   *          rejected if the was an exception throw in the mapping chain
   */
  promise<U extends Result<unknown, unknown>>(
    this: U
  ): Promise<InferOk<U> | never>;
}

interface ResultWrapper<TErrorOrValue> {
  value: TErrorOrValue;
  isError: boolean;
}
