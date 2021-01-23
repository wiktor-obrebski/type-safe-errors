import {
  OkMapper,
  ErrMapper,
  MapResult,
  MapErrResult,
  InferErr,
} from './mappers';
import { combine as combineResults } from './combine';

export { Ok, Err, Result };

namespace Result {
  export const combine = combineResults;
}

type Result<TValue, TError> = Ok<TValue> | Err<TError>;

class Ok<TValue> {
  readonly value: TValue;

  private constructor(value: TValue) {
    this.value = value;
  }

  static of<TValue>(value: TValue): Ok<TValue> {
    return new Ok(value);
  }

  isOk(): this is Ok<TValue> {
    return true;
  }

  isErr(): this is Err<unknown> {
    return false;
  }

  map<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: OkMapper<U, R>
  ): MapResult<U, R> {
    if (this.isOk()) {
      const newValue = mapper(this.value as any);
      if (isResult(newValue)) {
        return newValue as any;
      } else {
        return Ok.of(newValue) as any;
      }
    }

    return this as any;
  }

  mapErr<U extends Result<unknown, unknown>, R>(
    this: U,
    _mapper: ErrMapper<U, R>
  ): MapErrResult<U, R> {
    return this as any;
  }

  handle<U extends Result<unknown, unknown>, R, E extends InferErr<U>>(
    this: U,
    _ErrorClass: AClass<E>,
    _handler: (err: E) => R
  ): U {
    return this;
  }
}

class Err<TError> {
  readonly error: TError;

  static readonly unique1: unique symbol = Symbol();

  private constructor(error: TError) {
    this.error = error;
  }

  static of<TError>(error: TError): Err<TError> {
    return new Err(error);
  }

  isOk(): this is Ok<unknown> {
    return false;
  }

  isErr(): this is Err<TError> {
    return true;
  }

  map<U extends Result<unknown, unknown>, R>(
    this: U,
    _mapper: OkMapper<U, R>
  ): MapResult<U, R> {
    return this as any;
  }

  mapErr<U extends Result<unknown, unknown>, R>(
    this: U,
    mapper: ErrMapper<U, R>
  ): MapErrResult<U, R> {
    if (this.isErr()) {
      const newErr = mapper(this.error as any);
      if (isResult(newErr)) {
        return newErr as any;
      } else {
        return Err.of(newErr) as any;
      }
    }

    return this as any;
  }

  handle<U extends Result<unknown, unknown>, R, E extends InferErr<U>>(
    this: U,
    ErrorClass: AClass<E>,
    handler: (err: E) => R
  ): U {
    if (this.isErr() && this.error instanceof ErrorClass) {
      handler(this.error);
    }

    return this;
  }
}

function isResult(value: unknown): value is Result<unknown, unknown> {
  return value instanceof Ok || value instanceof Err;
}

interface AClass<C> {
  new (...args: any[]): C;
}
