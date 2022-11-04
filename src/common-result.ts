import { Result } from './types/result-helpers';
import { CommonResult, ResultWrapper } from './types/common-result';

export { CommonResult, isResult, commonResultFactory, resultWrapperFactory };

const CommonResultPrototype: CommonResult<unknown> = {
  __value: Promise.resolve(resultWrapperFactory(undefined, false)),
  __brand: undefined,

  map(mapper) {
    const newValWrapperPromise = this.__value.then((wrapper) => {
      if (wrapper.isError) {
        return wrapper;
      }

      return Promise.resolve()
        .then(() => mapper(wrapper.value as any))
        .then((newValue) => {
          if (isResult(newValue)) {
            return newValue.__value;
          } else {
            return resultWrapperFactory(newValue, false);
          }
        })
        .catch((err) => resultWrapperFactory(err, true));
    });
    return commonResultFactory(newValWrapperPromise) as any;
  },

  mapErr(ErrorClass, mapper) {
    const newValWrapperPromise = this.__value.then((wrapper) => {
      if (!(wrapper.isError && wrapper.value instanceof ErrorClass)) {
        return wrapper;
      }

      return Promise.resolve()
        .then(() => mapper(wrapper.value as any))
        .then((newValue) => {
          if (isResult(newValue)) {
            return newValue.__value;
          } else {
            return resultWrapperFactory(newValue, false);
          }
        })
        .catch((err) => resultWrapperFactory(err, true));
    });
    return commonResultFactory(newValWrapperPromise) as any;
  },

  mapAnyErr(mapper) {
    const newValWrapperPromise = this.__value.then((wrapper) => {
      if (!wrapper.isError) {
        return wrapper;
      }

      return Promise.resolve()
        .then(() => mapper(wrapper.value as any))
        .then((newValue) => {
          if (isResult(newValue)) {
            return newValue.__value;
          } else {
            return resultWrapperFactory(newValue, false);
          }
        })
        .catch((err) => resultWrapperFactory(err, true));
    });
    return commonResultFactory(newValWrapperPromise) as any;
  },

  unsafePromise() {
    return this.__value.then((wrapper) =>
      wrapper.isError
        ? Promise.reject(wrapper.value)
        : Promise.resolve(wrapper.value)
    ) as any;
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
