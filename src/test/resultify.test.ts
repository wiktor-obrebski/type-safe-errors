import { Err, Ok } from '../index';
import { resultify } from '../resultify';
import { shouldEventuallyOk, shouldEventuallyErr } from './helper';

class Error2 extends Error {
  name = 'Error2' as const;
}

suite.only('resultify of a sync function', () => {
  test('returns a function that yields `Ok` for a non-`Result` source function', (done) => {
    const value = 5;
    const nonResultReturningFunction = (val: number) => val * val;

    const resultifiedFunction: (val: number) => Ok<number> = resultify(
      nonResultReturningFunction
    );
    const resultifiedValue = resultifiedFunction(value);

    shouldEventuallyOk(resultifiedValue, 25, done);
  });

  // TODO: enable after rebase
  test.skip('returns a function that yields `Ok` for a throwing source function', (done) => {
    const err = new Error('Error but typed');
    const errReturningFunction = () => {
      throw err;
    };

    const resultifiedFunction: () => Ok<never> =
      resultify(errReturningFunction);
    const resultifiedValue = resultifiedFunction();

    shouldEventuallyErr(resultifiedValue, err, done);
  });

  test('returns a function that yields `Ok` for an `Ok` source function', (done) => {
    const okReturningFunction = (val: number) => Ok.of(val * val);
    const value = 4;

    const resultifiedFunction: (val: number) => Ok<number> =
      resultify(okReturningFunction);
    const resultifiedValue = resultifiedFunction(value);

    shouldEventuallyOk(resultifiedValue, 16, done);
  });

  test('returns a function that yields `Err` for an `Err` source function', (done) => {
    const error = new Error2();

    const errReturningFunction = () => {
      return Err.of(error);
    };

    const resultifiedFunction: () => Err<Error2> =
      resultify(errReturningFunction);
    const resultifiedValue = resultifiedFunction();

    shouldEventuallyErr(resultifiedValue, error, done);
  });
});

suite.only('resultify of an async function', () => {
  test('returns a function that yields `Ok` for a non-`Result` source function', (done) => {
    const value = 5;
    const nonResultReturningFunction = async (val: number) => val * val;

    const resultifiedFunction: (val: number) => Ok<number> = resultify(
      nonResultReturningFunction
    );
    const resultifiedValue = resultifiedFunction(value);

    shouldEventuallyOk(resultifiedValue, 25, done);
  });

  // TODO: enable after rebase
  test.skip('returns a function that yields `Ok` for a throwing source function', (done) => {
    const err = new Error('Error but typed');
    const errReturningFunction = async () => {
      throw err;
    };

    const resultifiedFunction: () => Ok<never> =
      resultify(errReturningFunction);
    const resultifiedValue = resultifiedFunction();

    shouldEventuallyErr(resultifiedValue, err, done);
  });

  test('returns a function that yields `Ok` for an `Ok` source function', (done) => {
    const okReturningFunction = async (val: number) => Ok.of(val * val);
    const value = 4;

    const resultifiedFunction: (val: number) => Ok<number> =
      resultify(okReturningFunction);
    const resultifiedValue = resultifiedFunction(value);

    shouldEventuallyOk(resultifiedValue, 16, done);
  });

  test('returns a function that yields `Err` for an `Err` source function', (done) => {
    const error = new Error2();

    const errReturningFunction = async () => {
      return Err.of(error);
    };

    const resultifiedFunction: () => Err<Error2> =
      resultify(errReturningFunction);
    const resultifiedValue = resultifiedFunction();

    shouldEventuallyErr(resultifiedValue, error, done);
  });
});
