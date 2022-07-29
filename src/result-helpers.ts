import { ResultWrapper } from './result-wrapper';

export {
  Result,
  AClass,
  Ok,
  OkMapper,
  MapFromResult,
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

  /**
   * Return fulfilled promise of current Ok Result value. To use the `promise()`
   * function you need first handle all known Err result values.
   * It is possible that it return rejected promise for unknown exceptions.
   * @returns promise of current Result value - fulfilled if the value is Ok, rejected if the was an exception throw in the mapping chain
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
    mapper: OkMapper<U, R>
  ): SpreadErrors<MapOkResult<SpreadErrors<U>, R>>;

  /**
   * Map current Result if it's a Err of a specific class.
   * It's left Ok Result and Err of different class unchanged.
   * You can use async function for mapping.
   * @param ErrorClass the class of specific error object that should be mapped
   * @param mapper the function used to map the current Err result, can be async
   * @returns new Result, mapped if current Result is Err of specific class, left unchanged otherwise
   */
  mapErr<U extends Result<unknown, unknown>, R, E extends InferErr<U>>(
    this: U,
    ErrorClass: AClass<E>,
    mapper: (err: E) => R
  ): SpreadErrors<MapErrResult<SpreadErrors<U>, R, E>>;

  /**
   * Map current Result if it's Err. It's left Ok Result unchanged.
   * You can use async function for mapping.
   * @param mapper the function used to map the current Err result, can be async
   * @returns new Result, mapped if current Result is Err, left unchanged otherwise
   */
  mapAnyErr<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: ErrMapper<U, R>
  ): SpreadErrors<MapAnyErrResult<SpreadErrors<U>, R>>;

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

type MapFromResult<R> = R extends Result<unknown, unknown>
  ? SpreadErrors<R>
  : R extends Promise<infer S>
  ? ResultOrOk<S>
  : ResultOrOk<R>;

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

type SpreadErrors<U extends Result<unknown, unknown>> = U extends Err<infer E>
  ? E extends unknown
    ? Err<E>
    : never
  : U;
