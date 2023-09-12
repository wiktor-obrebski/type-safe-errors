import type { ResultWrapper } from './common-result';

export type { Result, Constructor, Ok, Err, InferOk, InferErr, UnknownError };

interface UnknownError extends Error {
  name: '__UnknownError';

  cause?: unknown;
}

type BaseResult<TValue, TError> =
  | (TValue extends never ? never : Ok<TValue>)
  | (TError extends never ? never : Err<TError>);

type Result<TValue, TError> = BaseResult<TValue, TError> extends never
  ? // mapping result should never be never, it can be Ok of never if there is
    // no other Result's known
    Ok<never>
  : BaseResult<TValue, TError>;

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
    mapper: (value: InferOk<U>) => R
  ): Result<
    U extends Ok<unknown> ? InferOk<R> : never,
    InferErr<U> | InferErr<R>
  >;

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
    mapper: (err: E) => R
  ): Result<
    InferOk<R>,
    U extends Err<unknown> ? Exclude<InferErr<U>, E> | InferErr<R> : never
  >;

  /**
   * Map current Result if it's Err. It's left Ok Result unchanged.
   * You can use async function for mapping.
   * @param mapper the function used to map the current Err result, can be async
   * @returns new Result, mapped if current Result is Err, left unchanged otherwise
   */
  mapAnyErr<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: (value: InferErr<U>) => R
  ): Result<InferOk<U> | InferOk<R>, InferErr<R>>;

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

type InferSyncOk<U> = U extends Ok<infer T>
  ? T
  : U extends Err<unknown>
  ? never
  : U;
type InferOk<U> = U extends Promise<infer V> ? InferSyncOk<V> : InferSyncOk<U>;

type InferSyncErr<U> = U extends Err<infer T> ? T : never;
type InferErr<U> = U extends Promise<infer V>
  ? InferSyncErr<V>
  : InferSyncErr<U>;

interface Constructor<C> {
  new (...args: any[]): C;
}
