import { Result, Ok, Err } from './result';

export {
  OkMapper,
  MapOkResult,
  ErrMapper,
  MapAnyErrResult,
  MapErrResult,
  InferErr,
  AClass,
};

type InferOk<U extends Result<unknown, unknown>> = U extends Ok<infer T>
  ? T
  : never;

type InferErr<U extends Result<unknown, unknown>> = U extends Err<infer T>
  ? T
  : never;

type OkMapper<U extends Result<unknown, unknown>, R> = (value: InferOk<U>) => R;
type ErrMapper<U extends Result<unknown, unknown>, R> = (
  value: InferErr<U>
) => R;

type PromiseValue<TPromise> = TPromise extends Promise<infer T> ? T : TPromise;

type ResultOrOk<R> = R extends Result<unknown, unknown>
  ? R
  : Ok<PromiseValue<R>>;

type ResultOrErr<R> = undefined extends R
  ? never
  : R extends Result<unknown, unknown>
  ? R
  : Err<PromiseValue<R>>;

type MapOkResult<U extends Result<unknown, unknown>, R> = U extends Ok<unknown>
  ? R extends Promise<infer S>
    ? ResultOrOk<S>
    : ResultOrOk<R>
  : U;

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

type FilterOk<U extends Result<unknown, unknown>> = U extends Ok<unknown>
  ? U
  : never;

interface AClass<C> {
  new (...args: any[]): C;
}
