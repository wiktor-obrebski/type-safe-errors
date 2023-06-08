import {
  commonResultFactory,
  resultWrapperFactory,
  unknownErrorWrapperFactory,
  isResult,
} from './common-result';
import { ResultNamespace, OkNamespace, ErrNamespace } from './types/result';

export { Ok, OkNamespace, Err, ErrNamespace, Result, ResultNamespace };

const Result: ResultNamespace = {
  from(factory) {
    const factoryPromise = Promise.resolve().then(factory);
    const resultWrapperPromise = factoryPromise
      .then((result) => {
        if (isResult(result)) {
          return result.__value;
        } else {
          return resultWrapperFactory(result, false);
        }
      })
      .catch(unknownErrorWrapperFactory);

    return commonResultFactory(resultWrapperPromise) as any;
  },

  combine(results) {
    const wrappersPromise = Promise.all(results.map((res) => res.__value));
    const resultPromise = wrappersPromise.then((wrappers) => {
      const values = [];
      for (const wrapper of wrappers) {
        if (wrapper.isError) {
          return { ...wrapper } as any;
        } else {
          values.push(wrapper.value);
        }
      }
      return { isError: false, value: values };
    });

    return commonResultFactory(resultPromise) as any;
  },
};

const Ok: OkNamespace = {
  of(value) {
    const wrappedValue = Promise.resolve(resultWrapperFactory(value, false));
    return commonResultFactory(wrappedValue);
  },
};

const Err: ErrNamespace = {
  of(error) {
    const wrappedValue = Promise.resolve(resultWrapperFactory(error, true));
    return commonResultFactory(wrappedValue) as any;
  },
};
