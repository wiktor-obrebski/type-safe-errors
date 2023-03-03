export type {
  Ok,
  Err,
  Result,
  ResultWrapper,
  CommonResult,
  InferAsyncOk,
  InferAsyncErr,
  From,
  Combine,
};

type Result<TValue, TError> =
  | (TValue extends never ? never : Ok<TValue>)
  | (TError extends never ? never : Err<TError>);

interface ResultWrapper<TErrorOrValue> {
  value: TErrorOrValue;
  isError: boolean;
}

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

type CommonResult<TErrorOrValue> = Subresult & {
  readonly __value: Promise<ResultWrapper<TErrorOrValue>>;
  __brand: any;

  promise: Ok<unknown>['promise'];
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
  ): Result<InferAsyncOk<R>, InferErr<U> | InferAsyncErr<R>>;

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
    ErrorClass: Constructor<E>,
    mapper: (err: E) => R
  ): Result<
    InferOk<U> | InferAsyncOk<R>,
    Exclude<InferErr<U>, E> | InferAsyncErr<R>
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
  ): Result<InferOk<U> | InferAsyncOk<R>, InferAsyncErr<R>>;

  /**
   * Return fulfilled promise of current Ok Result value. To use the `promise()`
   * function you need first handle all known Err result values.
   * It is possible that it return rejected promise for unknown exceptions.
   * @returns promise of current Result value - fulfilled if the value is Ok, rejected if the was an exception throw in the mapping chain
   */
  promise<U extends Result<unknown, unknown>>(
    this: U
  ): Promise<InferOk<U> | never>;

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

interface Constructor<C> {
  new (...args: any[]): C;
}

type InferAsyncOk<R> = R extends Promise<infer V> ? InferOk<V> : InferOk<R>;
type InferOk<R> = R extends Ok<infer V>
  ? V
  : R extends Err<unknown>
  ? never
  : R;

type InferAsyncErr<R> = R extends Promise<infer V>
  ? InferAsyncErr<V>
  : InferErr<R>;
type InferErr<R> = R extends Err<infer E> ? E : never;

type From<R> = R extends () => infer V ? FromValue<V> : FromValue<R>;
type FromValue<R> = Result<InferAsyncOk<R>, InferAsyncErr<R>>;

type Combine<Results extends readonly unknown[]> = Result<
  { -readonly [P in keyof Results]: InferAsyncOk<Results[P]> },
  InferAsyncErr<Results[number]>
>;
