import { expect } from 'chai';
import { Result, Ok, Err } from './result';

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

suite('Result map for single Ok result', () => {
  const ok = Ok.of(5);

  test('returns maped result for mapper with plain return', done => {
    const mapped: Ok<'test-return'> = ok.map(value => {
      return 'test-return' as const;
    });

    shouldEventuallyOk(mapped, 'test-return', done);
  });

  test('returns maped result for mapper with ok result return', done => {
    const mapped: Ok<'test-return2'> = ok.map(value => {
      return Ok.of('test-return2' as const);
    });

    shouldEventuallyOk(mapped, 'test-return2', done);
  });

  test('returns maped result for mapper with err result return', done => {
    const mapped: Err<'test-return2'> = ok.map(value => {
      return Err.of('test-return2' as const);
    });

    shouldEventuallyErr(mapped, 'test-return2', done);
  });

  test('returns maped result for mapper with mixed result return', done => {
    const mapped: Result<'test-ok', 'test-err'> = ok.map(value => {
      return value > 6
        ? Err.of('test-err' as const)
        : Ok.of('test-ok' as const);
    });

    shouldEventuallyOk(mapped, 'test-ok', done);
  });

  test('returns maped result for mapper with promise of plain return', done => {
    async function getAsyncOk(value: number) {
      return `value of ${value}`;
    }
    const mapped: Ok<string> = ok.map(async value => {
      const res = await getAsyncOk(value);
      return res;
    });

    shouldEventuallyOk(mapped, 'value of 5', done);
  });

  test('returns maped result for mapper with promise of ok result return', done => {
    async function getAsyncOk(value: number) {
      return Ok.of(`ok of ${value}`);
    }
    const mapped: Ok<string> = ok.map(async value => {
      const res = await getAsyncOk(value);
      return res;
    });

    shouldEventuallyOk(mapped, 'ok of 5', done);
  });

  test('returns maped result for mapper with promise of err result return', done => {
    async function getAsyncOk(value: number) {
      return Err.of(`err of ${value}`);
    }
    const mapped: Err<string> = ok.map(async value => {
      const res = await getAsyncOk(value);
      return res;
    });

    shouldEventuallyErr(mapped, 'err of 5', done);
  });

  test('returns maped result for mapper with mixed result return', done => {
    async function getAsyncOk(value: number) {
      return value > 6
        ? Err.of('test-err' as const)
        : Ok.of('test-ok' as const);
    }

    const mapped: Result<'test-ok', 'test-err'> = ok.map(async value => {
      const res = await getAsyncOk(value);
      return res;
    });

    shouldEventuallyOk(mapped, 'test-ok', done);
  });
});

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
