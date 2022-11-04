import type {
  Result,
  AClass,
  OkMapper,
  MapOkResult,
  InferOk,
  ErrMapper,
  MapErrResult,
  MapAnyErrResult,
  InferErr,
  SpreadErrors,
} from './result-helpers';

export type { CommonResult, ResultWrapper };

interface CommonResult<TErrorOrValue> {
  readonly __value: Promise<ResultWrapper<TErrorOrValue>>;
  __brand: any;

  map<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: OkMapper<U, R>
  ): SpreadErrors<MapOkResult<SpreadErrors<U>, R>>;

  mapErr<U extends Result<unknown, unknown>, R, E extends InferErr<U>>(
    this: U,
    ErrorClass: AClass<E>,
    mapper: (err: E) => R
  ): SpreadErrors<MapErrResult<SpreadErrors<U>, R, E>>;

  mapAnyErr<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: ErrMapper<U, R>
  ): SpreadErrors<MapAnyErrResult<SpreadErrors<U>, R>>;

  unsafePromise<U extends Result<unknown, unknown>>(
    this: U
  ): Promise<InferOk<U> | never>;

  promise<U extends Result<unknown, unknown>>(
    this: U
  ): Promise<InferOk<U> | never>;
}

interface ResultWrapper<TErrorOrValue> {
  value: TErrorOrValue;
  isError: boolean;
}
