import { ResultWrapper } from './result-wrapper';

export {
  Result,
  AClass,
  Ok,
  OkMapper,
  MapOkResult,
  InferOk,
  Err,
  ErrMapper,
  MapErrResult,
  MapAnyErrResult,
  InferErr,
  SpreadErrors,
};

type Result<TValue, TError> = Ok<TValue> | Err<TError>;

type Ok<TValue> = Subresult & {
  readonly __value: Promise<ResultWrapper<TValue>>;

  __brand: 'ok';
};

type Err<TError> = Subresult & {
  readonly __value: Promise<ResultWrapper<TError>>;

  __brand: 'err';
};

interface Subresult {
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

  promise<U extends Result<unknown, unknown>>(
    this: U
  ): Promise<InferOk<U> | never>;
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

type MapAnyErrResult<
  U extends Result<unknown, unknown>,
  R
> = U extends Err<unknown>
  ? R extends Promise<infer S>
    ? ResultOrOk<S>
    : ResultOrOk<R>
  : U;

type MapErrResult<U extends Result<unknown, unknown>, R, E> = U extends Err<
  infer EUnion
>
  ? E extends EUnion
    ? R extends Promise<infer S>
      ? ResultOrOk<S>
      : ResultOrOk<R>
    : U
  : U;

interface AClass<C> {
  new (...args: any[]): C;
}

type Test1 = Ok<5> | Err<6 | 7>;

type SpreadErrors<U extends Result<unknown, unknown>> = U extends Err<infer E>
  ? E extends unknown
    ? Err<E>
    : never
  : U;
