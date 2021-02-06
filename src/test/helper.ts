import { expect } from 'chai';
import { Result } from '../result';

export { shouldEventuallyOk, shouldEventuallyErr };

async function shouldEventuallyOk<TValue>(
  result: Result<unknown, unknown>,
  value: TValue,
  done: (err?: any) => void
) {
  const wrapper = await result.__value;

  if (wrapper.isError) {
    done(`Ok result expected (${value}), got Err result`);
  } else {
    try {
      expect(wrapper.value).to.equal(value);
      done();
    } catch (err) {
      done(err);
    }
  }
}

async function shouldEventuallyErr<TValue>(
  result: Result<unknown, unknown>,
  value: TValue,
  done: (err?: any) => void
) {
  const wrapper = await result.__value;

  if (wrapper.isError) {
    try {
      expect(wrapper.value).to.equal(value);
      done();
    } catch (err) {
      done(err);
    }
  } else {
    done(`Err result expected (${value}), got Ok result`);
  }
}
