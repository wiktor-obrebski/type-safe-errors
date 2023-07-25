import { expect } from 'chai';
import { Err, Ok } from '../result';
import { resultify } from '../resultify';
import { shouldEventuallyOk, shouldEventuallyErr } from './helper';

class Error2 extends Error {
  name = 'Error2' as const;
}

suite('resultify', () => {
  suite(
    'should return function with changed return type to OK when given function:',
    () => {
      test('returns any non Result nor Error sync value', (done) => {
        const value = 'test-value';
        const nonResultReturningFunction = <T>(val: T) => val;

        const resultifiedFunction = resultify(nonResultReturningFunction);
        const resultifiedValue = resultifiedFunction(value);

        shouldEventuallyOk(resultifiedValue, value, done);
      });

      test('returns class Error value', (done) => {
        const value = new Error('Error but typed');
        const errReturningFunction = <T extends Error>(val: T) => val;

        const resultifiedFunction = resultify(errReturningFunction);
        const resultifiedValue = resultifiedFunction(value);

        shouldEventuallyOk(resultifiedValue, value, done);
      });

      test('returns OK value', (done) => {
        const okReturningFunction = <T>(val: T) => Ok.of(val);
        const value = 'OK';

        const resultifiedFunction = resultify(okReturningFunction);
        const resultifiedValue = resultifiedFunction(value);

        shouldEventuallyOk(resultifiedValue, value, done);
      });

      test('returns promise of any non Result nor Error value', (done) => {
        const functionToResultify = async () => 'value of 5';

        const resultifiedFunction = resultify(functionToResultify);
        const resultifiedValue = resultifiedFunction();

        shouldEventuallyOk(resultifiedValue, 'value of 5', done);
      });

      test('returns promise of Ok value', (done) => {
        const functionToResultify = async () => Ok.of('value of 5');

        const resultifiedFunction = resultify(functionToResultify);
        const resultifiedValue = resultifiedFunction();

        shouldEventuallyOk(resultifiedValue, 'value of 5', done);
      });

      test('returns promise of class Error value', (done) => {
        const error = new Error('test');
        const functionToResultify = async () => error;

        const resultifiedFunction = resultify(functionToResultify);
        const resultifiedValue = resultifiedFunction();

        shouldEventuallyOk(resultifiedValue, error, done);
      });
    }
  );

  suite(
    'should return function with changed return type to Err when given function:',
    () => {
      test('returns promise of Err value', (done) => {
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

      test('returns static Err value', (done) => {
        const value = new Error2();
        const errReturningFunction = <T>(val: T) => Err.of(val);

        const resultifiedFunction = resultify(errReturningFunction);
        const resultifiedValue = resultifiedFunction(value);

        shouldEventuallyErr(resultifiedValue, value, done);
      });
    }
  );

  test('should properly handling error when throwing inside', async () => {
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
