import { Result, Ok, Err } from '../index';
import { shouldEventuallyOk, shouldEventuallyErr } from './helper';

class Error1 {
  name = 'Error1' as const;
}

suite('Result.from of single Ok result factory', () => {
  test('returns maped result for mapper with plain return', (done) => {
    const mapped: Ok<'test-return'> = Result.from(() => {
      return 'test-return' as const;
    });

    shouldEventuallyOk(mapped, 'test-return', done);
  });

  test('returns maped result for mapper with ok result return', (done) => {
    const mapped: Ok<'test-return2'> = Result.from(() => {
      return Ok.of('test-return2' as const);
    });

    shouldEventuallyOk(mapped, 'test-return2', done);
  });

  test('returns maped result for mapper with err result return', (done) => {
    const err1 = new Error1();

    const mapped: Err<Error1> = Result.from(() => {
      return Err.of(err1);
    });

    shouldEventuallyErr(mapped, err1, done);
  });

  test('returns maped result for mapper with mixed result return', (done) => {
    const err1 = new Error1();
    const value = 5;

    const mapped: Result<'test-ok', Error1> = Result.from(() => {
      return value > 6 ? Err.of(err1) : Ok.of('test-ok' as const);
    });

    shouldEventuallyOk(mapped, 'test-ok', done);
  });

  test('returns maped result for mapper with promise of plain return', (done) => {
    async function getAsyncOk(value: number) {
      return `value of ${value}`;
    }
    const mapped: Ok<string> = Result.from(async () => {
      const res = await getAsyncOk(5);
      return res;
    });

    shouldEventuallyOk(mapped, 'value of 5', done);
  });

  test('returns maped result for mapper with promise of ok result return', (done) => {
    async function getAsyncOk(value: number) {
      return Ok.of(`ok of ${value}`);
    }
    const mapped: Ok<string> = Result.from(async () => {
      const res = await getAsyncOk(5);
      return res;
    });

    shouldEventuallyOk(mapped, 'ok of 5', done);
  });

  test('returns maped result for mapper with promise of err result return', (done) => {
    const err1 = new Error1();

    async function getAsyncErr(_value: number) {
      return Err.of(err1);
    }
    const mapped: Err<Error1> = Result.from(async () => {
      const res = await getAsyncErr(5);
      return res;
    });

    shouldEventuallyErr(mapped, err1, done);
  });

  test('returns maped result for mapper with mixed result return', (done) => {
    const err1 = new Error1();

    async function getAsyncResult(value: number) {
      return value > 6 ? Err.of(err1) : Ok.of('test-ok' as const);
    }

    const mapped: Result<'test-ok', Error1> = Result.from(async () => {
      const res = await getAsyncResult(5);
      return res;
    });

    shouldEventuallyOk(mapped, 'test-ok', done);
  });
});

suite('Result.from of result promise', () => {
  test('returns mapped result with promise of a plain value', (done) => {
    const mapped: Ok<number> = Result.from(Promise.resolve(5));

    shouldEventuallyOk(mapped, 5, done);
  });

  test('returns mapped result with promise of ok result', (done) => {
    const mapped: Ok<number> = Result.from(Promise.resolve(Ok.of(5)));

    shouldEventuallyOk(mapped, 5, done);
  });

  test('returns mapped result with promise of err result', (done) => {
    const err = new Error1();

    const mapped: Err<Error1> = Result.from(Promise.resolve(Err.of(err)));

    shouldEventuallyErr(mapped, err, done);
  });

  test('returns mapped result with promise of mixed results', (done) => {
    const mapped: Result<number, Error1> = Result.from(
      Promise.resolve(Ok.of(5)) as Promise<Result<number, Error1>>
    );

    shouldEventuallyOk(mapped, 5, done);
  });

  test('returns mapped result with promise of mixed plain values and err results', (done) => {
    const mapped: Result<number, Error1> = Result.from(
      Promise.resolve(5) as Promise<number | Result<never, Error1>>
    );

    shouldEventuallyOk(mapped, 5, done);
  });
});
