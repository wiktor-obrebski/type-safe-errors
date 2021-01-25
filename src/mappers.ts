import { Result, Ok, Err } from './result';

export type MapResult<T extends Result<unknown, unknown>, R> = T extends Ok<
  unknown
>
  ? R extends Result<unknown, unknown>
    ? R
    : Ok<R>
  : T;

export type OkMapper<U extends Result<unknown, unknown>, R> = (
  value: InferOk<U>
) => R;

export type MapErrResult<T extends Result<unknown, unknown>, R> = T extends Err<
  unknown
>
  ? R extends Result<unknown, unknown>
    ? R
    : Err<R>
  : T;

export type ErrMapper<U extends Result<unknown, unknown>, R> = (
  value: InferErr<U>
) => R;

export type InferErr<U extends Result<unknown, unknown>> = U extends Err<
  infer T
>
  ? T
  : never;

type InferOk<U extends Result<unknown, unknown>> = U extends Ok<infer T>
  ? T
  : never;

function isResult(
  value: Result<unknown, unknown> | unknown
): value is Result<unknown, unknown> {
  return value instanceof Ok || value instanceof Err;
}

type OkOfValue<V> = V extends Result<unknown, unknown> ? V : Ok<V>;
type ErrOfValue<V> = V extends Result<unknown, unknown> ? V : Err<V>;
