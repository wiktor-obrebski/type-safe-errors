import { expect } from 'chai';
import { Err, Ok } from '../../result';
import { resultify } from '../../utils';
import { shouldEventuallyOk, shouldEventuallyErr } from '../helper';

class Error2 extends Error {
  name = 'Error2' as const;
}

suite('utils/resultify', () => {
  suite('static values', () => {
    test('Properly resultify function returning non result value', (done) => {
      const value = 'test-value';
      const nonResultReturningFunction = <T>(val: T) => val;

      const resultifiedFunction = resultify(nonResultReturningFunction);
      const resultifiedValue = resultifiedFunction(value);

      shouldEventuallyOk(resultifiedValue, value, done);
    });

    test('Properly resultify function returning ok value', (done) => {
      const okReturningFunction = <T>(val: T) => Ok.of(val);
      const value = 'OK';

      const resultifiedFunction = resultify(okReturningFunction);
      const resultifiedValue = resultifiedFunction(value);

      shouldEventuallyOk(resultifiedValue, value, done);
    });

    test('Properly resultify function returning err value', (done) => {
      const value = new Error2();
      const errReturningFunction = <T>(val: T) => Err.of(val);

      const resultifiedFunction = resultify(errReturningFunction);
      const resultifiedValue = resultifiedFunction(value);

      shouldEventuallyErr(resultifiedValue, value, done);
    });

    test('Properly resultify function returning err value', (done) => {
      const value = new Error('Error but typed');
      const errReturningFunction = <T>(val: T) => Err.of(val);

      const resultifiedFunction = resultify(errReturningFunction);
      const resultifiedValue = resultifiedFunction(value);

      shouldEventuallyErr(resultifiedValue, value, done);
    });
  });

  suite('promises', () => {
    test('Properly resultify returning non result promise', (done) => {
      const nonResultReturningFunction = async () => {
        return await getAsyncOk(5);
      };

      async function getAsyncOk(value: number) {
        return `value of ${value}`;
      }

      const resultifiedFunction = resultify(nonResultReturningFunction);
      const resultifiedValue = resultifiedFunction();

      shouldEventuallyOk(resultifiedValue, 'value of 5', done);
    });

    test('Properly resultify function returning ok promise', (done) => {
      const nonResultReturningFunction = async () => {
        return await getAsyncOk(5);
      };

      async function getAsyncOk(value: number) {
        return Ok.of(`value of ${value}`);
      }

      const resultifiedFunction = resultify(nonResultReturningFunction);
      const resultifiedValue = resultifiedFunction();

      shouldEventuallyOk(resultifiedValue, 'value of 5', done);
    });

    test('Properly resultify function returning err promise', (done) => {
      const error = new Error2();

      async function getAsyncErr(_value: number) {
        return Err.of(error);
      }

      const errReturningFunction = async () => {
        return await getAsyncErr(5);
      };

      const resultifiedFunction = resultify(errReturningFunction);
      const resultifiedValue = resultifiedFunction();

      shouldEventuallyErr(resultifiedValue, error, done);
    });
  });

  test('Properly resultify function throwing inside', async () => {
    const error = new Error2();

    async function throwAsyncErr(_value: number) {
      throw error;
    }

    const errThrowingFunction = async () => {
      return await throwAsyncErr(5);
    };

    const resultifiedFunction = resultify(errThrowingFunction);
    const resultifiedValue = resultifiedFunction();
    return resultifiedValue
      .promise()
      .catch((err) => expect(err).to.equal(error));
  });
});
