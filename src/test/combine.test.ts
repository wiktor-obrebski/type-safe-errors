import { Result, Ok, Err } from '../index';
import {
  shouldEventuallyOk,
  shouldEventuallyErr,
  shouldBeAssignable,
} from './helper';

class Error1 extends Error {
  private __brand!: never;
}
class Error2 extends Error {
  private __brand!: never;
}
class Error3 extends Error {
  private __brand!: never;
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

test('Result combine of mixed types per Result and Result promises returns expected result', (done) => {
  const mixedResult1 = Ok.of('return-type') as
    | Err<Error1>
    | Ok<'return-type'>
    | undefined;
  const mixedAsycnResult = Promise.resolve(
    Ok.of('return-type2') as Err<Error2> | Ok<'return-type2'> | undefined
  );
  const errLiteralResult = undefined as undefined | Err<Error3>;

  const mapped: Result<
    [
      'return-type' | undefined,
      number,
      number,
      'return-type2' | undefined,
      undefined
    ],
    Error1 | Error2 | Error3
  > = Result.combine([
    mixedResult1,
    Ok.of(5),
    Promise.resolve(Ok.of(5)),
    mixedAsycnResult,
    errLiteralResult,
  ]);

  shouldEventuallyOk(
    mapped,
    ['return-type', 5, 5, 'return-type2', undefined],
    done
  );
});

test('Result.combine of results with possibly undefined values preserves possibly undefined values', (done) => {
  const result = Result.combine([
    Ok.of<string | undefined>(undefined),
    Ok.of<number | undefined>(5),
  ]);

  shouldBeAssignable(result, Ok.of<[string, number]>(['hello', 1]));
  shouldBeAssignable(
    result,
    Ok.of<[undefined, undefined]>([undefined, undefined])
  );
  shouldEventuallyOk(result, [undefined, 5], done);
});

test('Result.combine of results with nullable values preserves nullable values', (done) => {
  const result = Result.combine([
    Ok.of<string | null>(null),
    Ok.of<number | null>(5),
  ]);

  shouldBeAssignable(result, Ok.of<[string, number]>(['hello', 1]));
  shouldBeAssignable(result, Ok.of<[null, null]>([null, null]));
  shouldEventuallyOk(result, [null, 5], done);
});
