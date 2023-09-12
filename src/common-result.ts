import type {
  Result,
  UnknownError as UnknownErrorType,
} from './types/result-helpers';
import type { CommonResult, ResultWrapper } from './types/common-result';

export {
  CommonResult,
  UnknownError,
  isResult,
  commonResultFactory,
  resultWrapperFactory,
  wrapResultFactory,
};

class UnknownError extends Error implements UnknownErrorType {
  name = '__UnknownError' as const;

  cause?: unknown;

  constructor(cause: unknown) {
    super();
    this.cause = cause;
  }
}

const CommonResultPrototype: CommonResult<unknown> = {
  __value: Promise.resolve(resultWrapperFactory(undefined, false)),
  __brand: undefined,

  map(mapper) {
    const newValWrapperPromise = this.__value.then((wrapper) => {
      if (wrapper.isError) {
        return wrapper;
      }

      return wrapResultFactory(() => mapper(wrapper.value as any));
    });
    return commonResultFactory(newValWrapperPromise) as any;
  },

  mapErr(ErrorClass, mapper) {
    const newValWrapperPromise = this.__value.then((wrapper) => {
      if (!(wrapper.isError && wrapper.value instanceof ErrorClass)) {
        return wrapper;
      }

      return wrapResultFactory(() => mapper(wrapper.value as any));
    });
    return commonResultFactory(newValWrapperPromise) as any;
  },

  mapAnyErr(mapper) {
    const newValWrapperPromise = this.__value.then((wrapper) => {
      if (!wrapper.isError) {
        return wrapper;
      }

      return wrapResultFactory(() => mapper(wrapper.value as any));
    });
    return commonResultFactory(newValWrapperPromise) as any;
  },

  unsafePromise() {
    return this.__value.then((wrapper) => {
      if (wrapper.isError) {
        const originErr =
          wrapper.value instanceof UnknownError
            ? wrapper.value.cause
            : wrapper.value;
        return Promise.reject(originErr);
      }

      return Promise.resolve(wrapper.value);
    }) as any;
  },

  promise() {
    return this.unsafePromise();
  },
};

function commonResultFactory<TErrorOrValue>(
  value: Promise<ResultWrapper<TErrorOrValue>>
) {
  const commonResult = Object.create(CommonResultPrototype);
  commonResult.__value = value;
  return commonResult as CommonResult<TErrorOrValue>;
}

function isResult(value: unknown): value is Result<unknown, unknown> {
  return CommonResultPrototype.isPrototypeOf(value as any);
}

function resultWrapperFactory<TErrorOrValue>(
  value: TErrorOrValue,
  isError: boolean
): ResultWrapper<TErrorOrValue> {
  return { value, isError };
}

function unknownErrorWrapperFactory(err: unknown): ResultWrapper<UnknownError> {
  return { value: new UnknownError(err), isError: true };
}

function wrapResultFactory(valueFactory: () => unknown) {
  return Promise.resolve()
    .then(valueFactory)
    .then((result) =>
      isResult(result) ? result.__value : resultWrapperFactory(result, false)
    )
    .catch(unknownErrorWrapperFactory);
}
