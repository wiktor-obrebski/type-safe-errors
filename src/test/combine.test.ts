import { Result, Ok, Err } from '../index';
import { shouldEventuallyOk, shouldEventuallyErr } from './helper';

class Error1 {
  __brand!: 'Error1';
}
class Error2 {
  __brand!: 'Error2';
}
class Error3 {
  __brand!: 'Error3';
}
class Error4 {
  __brand!: 'Error4';
}

/**
 * The idea is to directly type specific operation results by expected type.
 * Thanks to do this the tests not only fail if runtime code has a bug, but they
 * won't compile in case of new bug introduction to lib typings
 */

// TODO: handle case when `map`/`mapErr`/`combine` throw real exception

test('Result combine of two Ok values result returns Ok result of array of two values', (done) => {
  const mapped: Result<['test-return1', 'test-return2'], never> = Result.combine([
    Ok.of('test-return1' as const),
    Ok.of('test-return2' as const)
  ]);

  shouldEventuallyOk(mapped, ['test-return1', 'test-return2'], done);
});

test('Result combine of Ok result and Err result value returns Err result with only original Err result value', (done) => {
  const err = new Error1()
  const mapped: Result<unknown, Error1> = Result.combine([
    Ok.of('test-return1' as const),
    Err.of(err)
  ]);
  mapped.mapAnyErr(x => console.log(x))

  shouldEventuallyErr(mapped, err, done);
});

test('Result combine of mixed Result values returns single Err or list of values', (done) => {
  const err = new Error1();
  const values = [
    Ok.of(5), Ok.of("test-return" as const),
    Err.of(err),
    Err.of(new Error2()),
    Err.of(new Error3())
  ];
  const mapped: Result<(number | "test-return")[], Error1 | Error2 | Error3> = Result.combine(values);

  shouldEventuallyErr(mapped, err, done);
});
