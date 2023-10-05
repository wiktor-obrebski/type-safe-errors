import type { ResultWrapper } from './common-result';

export type {
  Result,
  Constructor,
  Ok,
  MapFromResult,
  MapOkResult,
  InferOk,
  Err,
  ErrMapper,
  MapErrResult,
  MapAnyErrResult,
  InferErr,
  UnknownError,
  SimpleAwaited,
};

interface UnknownError extends Error {
  name: '__UnknownError';

  cause?: unknown;
}

type Result<TValue, TError> = Ok<TValue> | Err<TError>;

type Ok<TValue> = Subresult & {
  readonly __value: Promise<ResultWrapper<TValue>>;

  __brand: 'ok';

  /**
   * Return fulfilled promise of current Ok Result value. To use the `promise()`
   * function you need first handle all known Err result values.
   * It is possible that it return rejected promise for unknown exceptions.
   * @returns promise of current Result value - fulfilled if the value is Ok,
   *          rejected if there was an exception thrown anywhere in the mapping chain
   */
  promise<U extends Result<unknown, unknown>>(
    this: U
  ): Promise<InferOk<U> | never>;
};

type Err<TError> = Subresult & {
  readonly __value: Promise<ResultWrapper<TError>>;
  __brand: 'err';
};

interface Subresult {
  /**
   * Map current Result if it's Ok. It's left Err Result unchanged.
   * You can use async function for mapping.
   * @param mapper the function used to map the current Ok result, can be async
   * @returns new Result, mapped if current Result is Ok, left unchanged otherwise
   */
  map<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: (value: InferOk<U>) => R | Promise<R>
  ): MapOkResult<U, R>;

  /**
   * Map current Result if it's a Err of a specific class.
   * It's left Ok Result and Err of different class unchanged.
   * You can use async function for mapping.
   * @param ErrorClass the class of specific error object that should be mapped
   * @param mapper the function used to map the current Err result, can be async
   * @returns new Result, mapped if current Result is Err of specific class, left unchanged otherwise
   */
  mapErr<
    U extends Result<unknown, unknown>,
    R,
    E extends InferErr<U> | UnknownError
  >(
    this: U,
    ErrorClass: Constructor<E>,
    mapper: (err: E) => R | Promise<R>
  ): MapErrResult<U, R, E>;

  /**
   * Map current Result if it's Err. It's left Ok Result unchanged.
   * You can use async function for mapping.
   * @param mapper the function used to map the current Err result, can be async
   * @returns new Result, mapped if current Result is Err, left unchanged otherwise
   */
  mapAnyErr<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: ErrMapper<U, R>
  ): MapAnyErrResult<U, R>;

  /**
   * WARNING: it's not recommended to use this function. consider using `promise()` instead.
   * Return promise of current Result value - fulfilled if the value is Ok,
   * rejected if the value is Err. The Err type will be lost in the process.
   * @returns promise of current Result value - fulfilled if the value is Ok, rejected if the value is Err
   */
  unsafePromise<U extends Result<unknown, unknown>>(
    this: U
  ): Promise<InferOk<U> | never>;
}

// build-in awaited is much more complex, often makes the types too deep
type SimpleAwaited<TPromise> = TPromise extends Promise<infer T> ? T : TPromise;

type InferOk<U> = U extends Ok<infer T> ? T : never;

type InferErr<U> = U extends Err<infer T> ? T : never;

type ErrMapper<U extends Result<unknown, unknown>, R> = (
  value: InferErr<U> | UnknownError
) => R | Promise<R>;

type MapFromResult<R> = ResultOrOk<SimpleAwaited<R>> | Ok<never>;

type MapOkResult<U, R> = U extends Ok<unknown> ? ResultOrOk<R> | Ok<never> : U;

type MapAnyErrResult<
  U extends Result<unknown, unknown>,
  R
> = U extends Err<unknown>
  ? ResultOrOk<Exclude<SimpleAwaited<R>, Err<UnknownError>>> | Ok<never>
  : U;

type MapErrResult<U, R, E> = U extends Err<infer EUnion>
  ? E extends EUnion
    ? ResultOrOk<R> | Ok<never>
    : U
  : U;

type ResultOrOk<R> = R extends Result<unknown, unknown> ? R : Ok<R>;

interface Constructor<C> {
  new (...args: any[]): C;
}
