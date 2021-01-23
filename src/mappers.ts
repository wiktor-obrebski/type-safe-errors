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

export async function asyncMap<
  U extends Result<unknown, unknown>,
  R,
  S = never
>(
  result: U,
  mapper: (value: U extends Ok<infer T> ? T : never) => Promise<R>,
  errMapper?: (value: U extends Err<infer U> ? U : never) => Promise<S>
): Promise<U extends Err<infer E> ? ErrOfValue<E> : OkOfValue<R>> {
  if (result.isOk()) {
    const newValue = await mapper(result.value as any);
    if (isResult(newValue)) {
      return newValue as any;
    } else {
      return Ok.of(newValue) as any;
    }
  } else if (result.isErr()) {
    const newValue = errMapper
      ? await errMapper(result.error as any)
      : result.error;
    if (isResult(newValue)) {
      return newValue as any;
    } else {
      return Err.of(newValue) as any;
    }
  }

  throw new Error('Invalid argument');
}

function isResult(
  value: Result<unknown, unknown> | unknown
): value is Result<unknown, unknown> {
  return value instanceof Ok || value instanceof Err;
}

type OkOfValue<V> = V extends Result<unknown, unknown> ? V : Ok<V>;
type ErrOfValue<V> = V extends Result<unknown, unknown> ? V : Err<V>;
