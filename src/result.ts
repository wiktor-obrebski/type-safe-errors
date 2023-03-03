import {
  commonResultFactory,
  resultWrapperFactory,
  wrap,
} from './common-result';
import { ResultNamespace, OkNamespace, ErrNamespace } from './types/result';

export { Ok, OkNamespace, Err, ErrNamespace, Result, ResultNamespace };

const Result: ResultNamespace = {
  from(value) {
    const wrapperPromise = wrap(typeof value === 'function' ? value() : value);
    return commonResultFactory(wrapperPromise) as any;
  },

  combine(results) {
    const wrapperPromises = results.map((result) => wrap(result));

    const resultPromise = Promise.all(wrapperPromises).then((wrappers) => {
      const values = [];

      for (const wrapper of wrappers) {
        if (wrapper.isError) {
          return { ...wrapper } as any;
        } else {
          values.push(wrapper.value);
        }
      }

      return resultWrapperFactory(values, false);
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
