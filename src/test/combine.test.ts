import { Result, Ok, Err } from '../index';
import { shouldEventuallyOk, shouldEventuallyErr } from './helper';

class Error1 extends Error {
  name = 'Error1' as const;
}
class Error2 extends Error {
  name = 'Error2' as const;
}
class Error3 extends Error {
  name = 'Error3' as const;
}

test('Result combine of two Ok values result returns Ok result of array of two values', (done) => {
  const mapped: Result<['test-return1', 'test-return2'], never> =
    Result.combine([
      Ok.of('test-return1' as const),
      Ok.of('test-return2' as const),
    ]);

  shouldEventuallyOk(mapped, ['test-return1', 'test-return2'], done);
});

test('Result combine of Ok result and Err result value returns Err result with only original Err result value', (done) => {
  const err = new Error1();
  const mapped: Result<unknown, Error1> = Result.combine([
    Ok.of('test-return1' as const),
    Err.of(err),
  ]);
  mapped.mapAnyErr((x) => console.log(x));

  shouldEventuallyErr(mapped, err, done);
});

test('Result combine of mixed Result values returns single Err or list of values', (done) => {
  const err = new Error1();
  const values = [
    Ok.of(5),
    Ok.of('test-return' as const),
    Err.of(err),
    Err.of(new Error2()),
    Err.of(new Error3()),
  ];
  const mapped: Result<(number | 'test-return')[], Error1 | Error2 | Error3> =
    Result.combine(values);

  shouldEventuallyErr(mapped, err, done);
});

test('Result combine of mixed types per Result returns expected result', (done) => {
  const mixedResult1 = Ok.of('return-type') as Err<Error1> | Ok<'return-type'>;

  const mapped: Result<['return-type', number], Error1> = Result.combine([
    mixedResult1,
    Ok.of(5),
  ]);

  shouldEventuallyOk(mapped, ['return-type', 5], done);
});

suite('Result.combine of results promise', () => {
  test('returns mapped results of promise of ok results', (done) => {
    const results = Promise.all([Ok.of(5), Ok.of('hello')]);
    const mapped: Ok<[number, string]> = Result.combine(results);

    shouldEventuallyOk(mapped, [5, 'hello'], done);
  });

  test('returns mapped results of promise of err results', (done) => {
    const err1 = new Error1();
    const err2 = new Error2();
    const results = Promise.all([
      Err.of(err1) as Result<string, Error1>,
      Err.of(err2) as Result<number, Error2>,
    ]);

    const mapped: Result<[string, number], Error1 | Error2> =
      Result.combine(results);

    shouldEventuallyErr(mapped, err1, done);
  });

  test('returns mapped result of promise of mixed results', (done) => {
    const err1 = new Error1();
    const err2 = new Error2();
    const results = Promise.all([
      Ok.of('hello'),
      Err.of(err1) as Result<string, Error1>,
      Ok.of(5),
      Err.of(err2) as Result<number, Error2>,
    ]);

    const mapped: Result<[string, string, number, number], Error1 | Error2> =
      Result.combine(results);

    shouldEventuallyErr(mapped, err1, done);
  });
});
