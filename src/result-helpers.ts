import { ResultWrapper } from './result-wrapper';

export {
  Result, AClass,
  Ok, OkMapper, MapOkResult,
  Err, ErrMapper, MapErrResult, MapAnyErrResult, InferErr,
};

type Result<TValue, TError> = Ok<TValue> | Err<TError>;

interface Ok<TValue> extends Subresult {
  readonly __value: Promise<ResultWrapper<TValue>>;

  __brand: 'ok';
}

interface Err<TError> extends Subresult {
  readonly __value: Promise<ResultWrapper<TError>>;

  __brand: 'err';
}

interface Subresult {
  map<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: OkMapper<U, R>
  ): MapOkResult<U, R>;

  mapErr<U extends Result<unknown, unknown>, R, E extends InferErr<U>>(
    this: U,
    ErrorClass: AClass<E>,
    mapper: (err: E) => R
  ): MapErrResult<U, R, E>;

  mapAnyErr<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: ErrMapper<U, R>
  ): MapAnyErrResult<U, R>;
}

type OkMapper<U extends Result<unknown, unknown>, R> = (value: InferOk<U>) => R;

type InferOk<U extends Result<unknown, unknown>> = U extends Ok<infer T>
  ? T
  : never;

type InferErr<U extends Result<unknown, unknown>> = U extends Err<infer T>
  ? T
  : never;

type ErrMapper<U extends Result<unknown, unknown>, R> = (
  value: InferErr<U>
) => R;

type MapOkResult<U extends Result<unknown, unknown>, R> = U extends Ok<unknown>
  ? R extends Promise<infer S>
    ? ResultOrOk<S>
    : ResultOrOk<R>
  : U;

type PromiseValue<TPromise> = TPromise extends Promise<infer T> ? T : TPromise;

type ResultOrOk<R> = R extends Result<unknown, unknown>
  ? R
  : Ok<PromiseValue<R>>;

type ResultOrErr<R> = undefined extends R
  ? never
  : R extends Result<unknown, unknown>
  ? R
  : Err<PromiseValue<R>>;

type MapAnyErrResult<U extends Result<unknown, unknown>, R> = U extends Err<
  unknown
>
  ? R extends Promise<infer S>
    ? ResultOrErr<S>
    : ResultOrErr<R>
  : U;

type MapErrResult<U extends Result<unknown, unknown>, R, E> = U extends Err<
  infer EUnion
>
  ? E extends EUnion
    ? R extends Promise<infer S>
      ? ResultOrErr<S>
      : ResultOrErr<R>
    : U
  : U;

interface AClass<C> {
  new (...args: any[]): C;
}
