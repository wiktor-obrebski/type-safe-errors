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

/**
 * The idea is to directly type specific operation results by expected type.
 * Thanks to do this the tests not only fail if runtime code has a bug, but they
 * won't compile in case of new bug introduction to lib typings
 */

// TODO: handle case when `map`/`mapErr`/`combine` throw real exception

suite('Result map of single Ok result', () => {
  const result = Ok.of(5);

  test('returns maped result for mapper with plain return', (done) => {
    const mapped: Ok<'test-return'> = result.map((_value: number) => {
      return 'test-return' as const;
    });

    shouldEventuallyOk(mapped, 'test-return', done);
  });

  test('returns maped result for mapper with ok result return', (done) => {
    const mapped: Ok<'test-return2'> = result.map((_value: number) => {
      return Ok.of('test-return2' as const);
    });

    shouldEventuallyOk(mapped, 'test-return2', done);
  });

  test('returns maped result for mapper with err result return', (done) => {
    const err1 = new Error1();

    const mapped: Err<Error1> = result.map((_value: number) => {
      return Err.of(err1);
    });

    shouldEventuallyErr(mapped, err1, done);
  });

  test('returns maped result for mapper with mixed result return', (done) => {
    const err1 = new Error1();

    const mapped: Result<'test-ok', Error1> = result.map((value: number) => {
      return value > 6 ? Err.of(err1) : Ok.of('test-ok' as const);
    });

    shouldEventuallyOk(mapped, 'test-ok', done);
  });

  test('returns maped result for mapper with promise of plain return', (done) => {
    async function getAsyncOk(value: number) {
      return `value of ${value}`;
    }
    const mapped: Ok<string> = result.map(async (value: number) => {
      const res = await getAsyncOk(value);
      return res;
    });

    shouldEventuallyOk(mapped, 'value of 5', done);
  });

  test('returns maped result for mapper with promise of ok result return', (done) => {
    async function getAsyncOk(value: number) {
      return Ok.of(`ok of ${value}`);
    }
    const mapped: Ok<string> = result.map(async (value: number) => {
      const res = await getAsyncOk(value);
      return res;
    });

    shouldEventuallyOk(mapped, 'ok of 5', done);
  });

  test('returns maped result for mapper with promise of err result return', (done) => {
    const err1 = new Error1();

    async function getAsyncOk(_value: number) {
      return Err.of(err1);
    }
    const mapped: Err<Error1> = result.map(async (value: number) => {
      const res = await getAsyncOk(value);
      return res;
    });

    shouldEventuallyErr(mapped, err1, done);
  });

  test('returns maped result for mapper with mixed result return', (done) => {
    const err1 = new Error1();

    async function getAsyncOk(value: number) {
      return value > 6 ? Err.of(err1) : Ok.of('test-ok' as const);
    }

    const mapped: Result<'test-ok', Error1> = result.map(
      async (value: number) => {
        const res = await getAsyncOk(value);
        return res;
      }
    );

    shouldEventuallyOk(mapped, 'test-ok', done);
  });
});

suite('Result map of Err result should not be affected by', () => {
  const errInstance = new Error1();
  const result = Err.of(errInstance);

  test('mapper with plain return', (done) => {
    const mapped: Err<Error1> = result.map((_value: never) => {
      return 'test-return' as const;
    });

    shouldEventuallyErr(mapped, errInstance, done);
  });

  test('mapper with ok result return', (done) => {
    const mapped: Err<Error1> = result.map((_value: never) => {
      return Ok.of('test-return2' as const);
    });

    shouldEventuallyErr(mapped, errInstance, done);
  });

  test('mapper with err result return', (done) => {
    const err1 = new Error1();

    const mapped: Err<Error1> = result.map((_value: never) => {
      return Err.of(err1);
    });

    shouldEventuallyErr(mapped, errInstance, done);
  });

  test('mapper with mixed result return', (done) => {
    const err1 = new Error1();

    const mapped: Err<Error1> = result.map((value: never) => {
      return value > 6 ? Err.of(err1) : Ok.of('test-ok' as const);
    });

    shouldEventuallyErr(mapped, errInstance, done);
  });

  test('mapper with promise of plain return', (done) => {
    async function getAsyncOk(value: never) {
      return `value of ${value}`;
    }
    const mapped: Err<Error1> = result.map(async (value: never) => {
      const res = await getAsyncOk(value);
      return res;
    });

    shouldEventuallyErr(mapped, errInstance, done);
  });

  test('mapper with promise of ok result return', (done) => {
    async function getAsyncOk(value: never) {
      return Ok.of(`ok of ${value}`);
    }
    const mapped: Err<Error1> = result.map(async (value: never) => {
      const res = await getAsyncOk(value);
      return res;
    });

    shouldEventuallyErr(mapped, errInstance, done);
  });

  test('mapper with promise of err result return', (done) => {
    const err1 = new Error1();

    async function getAsyncOk(_value: never) {
      return Err.of(err1);
    }
    const mapped: Err<Error1> = result.map(async (value: never) => {
      const res = await getAsyncOk(value);
      return res;
    });

    shouldEventuallyErr(mapped, errInstance, done);
  });

  test('mapper with mixed result return', (done) => {
    const err1 = new Error1();

    async function getAsyncOk(value: never) {
      return value > 6 ? Err.of(err1) : Ok.of('test-ok' as const);
    }

    const mapped: Err<Error1> = result.map(async (value: never) => {
      const res = await getAsyncOk(value);
      return res;
    });

    shouldEventuallyErr(mapped, errInstance, done);
  });
});

suite('Result map of mixed Ok and Err results', () => {
  type MixedResult<TValue> = Ok<TValue> | Err<Error1>;

  const result = Ok.of(5) as MixedResult<number>;

  test('returns maped result for mapper with plain return', (done) => {
    const mapped: MixedResult<'test-return'> = result.map((_value: number) => {
      return 'test-return' as const;
    });

    shouldEventuallyOk(mapped, 'test-return', done);
  });

  test('returns maped result for mapper with ok result return', (done) => {
    const mapped: MixedResult<'test-return2'> = result.map((_value: number) => {
      return Ok.of('test-return2' as const);
    });

    shouldEventuallyOk(mapped, 'test-return2', done);
  });

  test('returns maped result for mapper with err result return', (done) => {
    const err2 = new Error2();

    const mapped: Err<Error2> | Err<Error1> = result.map((_value: number) => {
      return Err.of(err2);
    });

    shouldEventuallyErr(mapped, err2, done);
  });

  test('returns maped result for mapper with mixed result return', (done) => {
    const err2 = new Error2();

    const mapped: Result<'test-ok', Error2 | Error1> = result.map(
      (value: number) => {
        return value > 6 ? Err.of(err2) : Ok.of('test-ok' as const);
      }
    );

    shouldEventuallyOk(mapped, 'test-ok', done);
  });

  test('returns maped result for mapper with promise of plain return', (done) => {
    async function getAsyncOk(value: number) {
      return `value of ${value}`;
    }
    const mapped: MixedResult<string> = result.map(async (value: number) => {
      const res = await getAsyncOk(value);
      return res;
    });

    shouldEventuallyOk(mapped, 'value of 5', done);
  });

  test('returns maped result for mapper with promise of ok result return', (done) => {
    async function getAsyncOk(value: number) {
      return Ok.of(`ok of ${value}`);
    }
    const mapped: MixedResult<string> = result.map(async (value: number) => {
      const res = await getAsyncOk(value);
      return res;
    });

    shouldEventuallyOk(mapped, 'ok of 5', done);
  });

  test('returns maped result for mapper with promise of err result return', (done) => {
    const err2 = new Error2();

    async function getAsyncOk(_value: number) {
      return Err.of(err2);
    }
    const mapped: Err<Error2> | Err<Error1> = result.map(
      async (value: number) => {
        const res = await getAsyncOk(value);
        return res;
      }
    );

    shouldEventuallyErr(mapped, err2, done);
  });

  test('returns maped result for mapper with mixed result return', (done) => {
    const err2 = new Error2();

    async function getAsyncOk(value: number) {
      return value > 6 ? Err.of(err2) : Ok.of('test-ok' as const);
    }

    const mapped: Result<'test-ok', Error2 | Error1> = result.map(
      async (value: number) => {
        const res = await getAsyncOk(value);
        return res;
      }
    );

    shouldEventuallyOk(mapped, 'test-ok', done);
  });
});

suite('Result map of multiple Ok results', () => {
  const result = Ok.of(5) as Ok<number> | Ok<string>;

  test('returns maped result for mapper with plain return', (done) => {
    const mapped: Ok<'test-return'> = result.map((_value: number | string) => {
      return 'test-return' as const;
    });

    shouldEventuallyOk(mapped, 'test-return', done);
  });

  test('returns maped result for mapper with ok result return', (done) => {
    const mapped: Ok<'test-return2'> = result.map((_value: number | string) => {
      return Ok.of('test-return2' as const);
    });

    shouldEventuallyOk(mapped, 'test-return2', done);
  });

  test('returns maped result for mapper with err result return', (done) => {
    const err1 = new Error1();

    const mapped: Err<Error1> = result.map((_value: number | string) => {
      return Err.of(err1);
    });

    shouldEventuallyErr(mapped, err1, done);
  });

  test('returns maped result for mapper with mixed result return', (done) => {
    const err1 = new Error1();

    const mapped: Result<'test-ok', Error1> = result.map(
      (value: number | string) => {
        return value > 6 ? Err.of(err1) : Ok.of('test-ok' as const);
      }
    );

    shouldEventuallyOk(mapped, 'test-ok', done);
  });

  test('returns maped result for mapper with promise of plain return', (done) => {
    async function getAsyncOk(value: number | string) {
      return `value of ${value}`;
    }
    const mapped: Ok<string> = result.map(async (value: number | string) => {
      const res = await getAsyncOk(value);
      return res;
    });

    shouldEventuallyOk(mapped, 'value of 5', done);
  });

  test('returns maped result for mapper with promise of ok result return', (done) => {
    async function getAsyncOk(value: number | string) {
      return Ok.of(`ok of ${value}`);
    }
    const mapped: Ok<string> = result.map(async (value: number | string) => {
      const res = await getAsyncOk(value);
      return res;
    });

    shouldEventuallyOk(mapped, 'ok of 5', done);
  });

  test('returns maped result for mapper with promise of err result return', (done) => {
    const err1 = new Error1();

    async function getAsyncOk(_value: number | string) {
      return Err.of(err1);
    }
    const mapped: Err<Error1> = result.map(async (value: number | string) => {
      const res = await getAsyncOk(value);
      return res;
    });

    shouldEventuallyErr(mapped, err1, done);
  });

  test('returns maped result for mapper with mixed result return', (done) => {
    const err1 = new Error1();

    async function getAsyncOk(value: number | string) {
      return value > 6 ? Err.of(err1) : Ok.of('test-ok' as const);
    }

    const mapped: Result<'test-ok', Error1> = result.map(
      async (value: number | string) => {
        const res = await getAsyncOk(value);
        return res;
      }
    );

    shouldEventuallyOk(mapped, 'test-ok', done);
  });
});

suite('Result map of mixed Ok and 2 Err results', () => {
  type MixedResult<TValue> = Ok<TValue> | Err<Error1> | Err<Error2>;

  const result = Ok.of(5) as MixedResult<number>;

  test('returns maped result for mapper with plain return', (done) => {
    const mapped: MixedResult<'test-return'> = result.map((_value: number) => {
      return 'test-return' as const;
    });

    shouldEventuallyOk(mapped, 'test-return', done);
  });

  test('returns maped result for mapper with ok result return', (done) => {
    const mapped: MixedResult<'test-return2'> = result.map((_value: number) => {
      return Ok.of('test-return2' as const);
    });

    shouldEventuallyOk(mapped, 'test-return2', done);
  });

  test('returns maped result for mapper with err result return', (done) => {
    const err3 = new Error3();

    const mapped: Err<Error3> | Err<Error1> | Err<Error2> = result.map(
      (_value: number) => {
        return Err.of(err3);
      }
    );

    shouldEventuallyErr(mapped, err3, done);
  });

  test('returns maped result for mapper with mixed result return', (done) => {
    const err3 = new Error3();

    const mapped: Result<'test-ok', Error3 | Error1 | Error2> = result.map(
      (value: number) => {
        return value > 6 ? Err.of(err3) : Ok.of('test-ok' as const);
      }
    );

    shouldEventuallyOk(mapped, 'test-ok', done);
  });

  test('returns maped result for mapper with promise of plain return', (done) => {
    async function getAsyncOk(value: number) {
      return `value of ${value}`;
    }
    const mapped: MixedResult<string> = result.map(async (value: number) => {
      const res = await getAsyncOk(value);
      return res;
    });

    shouldEventuallyOk(mapped, 'value of 5', done);
  });

  test('returns maped result for mapper with promise of ok result return', (done) => {
    async function getAsyncOk(value: number) {
      return Ok.of(`ok of ${value}`);
    }
    const mapped: MixedResult<string> = result.map(async (value: number) => {
      const res = await getAsyncOk(value);
      return res;
    });

    shouldEventuallyOk(mapped, 'ok of 5', done);
  });

  test('returns maped result for mapper with promise of err result return', (done) => {
    const err3 = new Error3();

    async function getAsyncOk(_value: number) {
      return Err.of(err3);
    }
    const mapped: Err<Error3> | Err<Error1> | Err<Error2> = result.map(
      async (value: number) => {
        const res = await getAsyncOk(value);
        return res;
      }
    );

    shouldEventuallyErr(mapped, err3, done);
  });

  test('returns maped result for mapper with mixed result return', (done) => {
    const err3 = new Error3();

    async function getAsyncOk(value: number) {
      return value > 6 ? Err.of(err3) : Ok.of('test-ok' as const);
    }

    const mapped: Result<'test-ok', Error3 | Error1 | Error2> = result.map(
      async (value: number) => {
        const res = await getAsyncOk(value);
        return res;
      }
    );

    shouldEventuallyOk(mapped, 'test-ok', done);
  });
});

suite('Result map of multiple Err results should not be affected by', () => {
  const errInstance = new Error1();
  const result = Err.of(errInstance) as Err<Error1> | Err<Error2>;

  test('mapper with plain return', (done) => {
    const mapped: Err<Error1> | Err<Error2> = result.map((_value: never) => {
      return 'test-return' as const;
    });

    shouldEventuallyErr(mapped, errInstance, done);
  });

  test('mapper with ok result return', (done) => {
    const mapped: Err<Error1> | Err<Error2> = result.map((_value: never) => {
      return Ok.of('test-return2' as const);
    });

    shouldEventuallyErr(mapped, errInstance, done);
  });

  test('mapper with err result return', (done) => {
    const err1 = new Error1();

    const mapped: Err<Error1> | Err<Error2> = result.map((_value: never) => {
      return Err.of(err1);
    });

    shouldEventuallyErr(mapped, errInstance, done);
  });

  test('mapper with mixed result return', (done) => {
    const err1 = new Error1();

    const mapped: Err<Error1> | Err<Error2> = result.map((value: never) => {
      return value > 6 ? Err.of(err1) : Ok.of('test-ok' as const);
    });

    shouldEventuallyErr(mapped, errInstance, done);
  });

  test('mapper with promise of plain return', (done) => {
    async function getAsyncOk(value: never) {
      return `value of ${value}`;
    }
    const mapped: Err<Error1> | Err<Error2> = result.map(
      async (value: never) => {
        const res = await getAsyncOk(value);
        return res;
      }
    );

    shouldEventuallyErr(mapped, errInstance, done);
  });

  test('mapper with promise of ok result return', (done) => {
    async function getAsyncOk(value: never) {
      return Ok.of(`ok of ${value}`);
    }
    const mapped: Err<Error1> | Err<Error2> = result.map(
      async (value: never) => {
        const res = await getAsyncOk(value);
        return res;
      }
    );

    shouldEventuallyErr(mapped, errInstance, done);
  });

  test('mapper with promise of err result return', (done) => {
    const err1 = new Error1();

    async function getAsyncOk(_value: never) {
      return Err.of(err1);
    }
    const mapped: Err<Error1> | Err<Error2> = result.map(
      async (value: never) => {
        const res = await getAsyncOk(value);
        return res;
      }
    );

    shouldEventuallyErr(mapped, errInstance, done);
  });

  test('mapper with mixed result return', (done) => {
    const err1 = new Error1();

    async function getAsyncOk(value: never) {
      return value > 6 ? Err.of(err1) : Ok.of('test-ok' as const);
    }

    const mapped: Err<Error1> | Err<Error2> = result.map(
      async (value: never) => {
        const res = await getAsyncOk(value);
        return res;
      }
    );

    shouldEventuallyErr(mapped, errInstance, done);
  });
});

suite('Result map of mixed 2 Ok and 2 Err results', () => {
  type MixedResult<TValue> = Ok<TValue> | Err<Error1> | Err<Error2>;

  const result = Ok.of(5) as Ok<string> | MixedResult<number>;

  test('returns maped result for mapper with plain return', (done) => {
    const mapped: MixedResult<'test-return'> = result.map(
      (_value: number | string) => {
        return 'test-return' as const;
      }
    );

    shouldEventuallyOk(mapped, 'test-return', done);
  });

  test('returns maped result for mapper with ok result return', (done) => {
    const mapped: MixedResult<'test-return2'> = result.map(
      (_value: number | string) => {
        return Ok.of('test-return2' as const);
      }
    );

    shouldEventuallyOk(mapped, 'test-return2', done);
  });

  test('returns maped result for mapper with err result return', (done) => {
    const err3 = new Error3();

    const mapped: Err<Error3> | Err<Error1> | Err<Error2> = result.map(
      (_value: number | string) => {
        return Err.of(err3);
      }
    );

    shouldEventuallyErr(mapped, err3, done);
  });

  test('returns maped result for mapper with mixed result return', (done) => {
    const err3 = new Error3();

    const mapped: Result<'test-ok', Error3 | Error1 | Error2> = result.map(
      (value: number | string) => {
        return value > 6 ? Err.of(err3) : Ok.of('test-ok' as const);
      }
    );

    shouldEventuallyOk(mapped, 'test-ok', done);
  });

  test('returns maped result for mapper with promise of plain return', (done) => {
    async function getAsyncOk(value: number | string) {
      return `value of ${value}`;
    }
    const mapped: MixedResult<string> = result.map(
      async (value: number | string) => {
        const res = await getAsyncOk(value);
        return res;
      }
    );

    shouldEventuallyOk(mapped, 'value of 5', done);
  });

  test('returns maped result for mapper with promise of ok result return', (done) => {
    async function getAsyncOk(value: number | string) {
      return Ok.of(`ok of ${value}`);
    }
    const mapped: MixedResult<string> = result.map(
      async (value: number | string) => {
        const res = await getAsyncOk(value);
        return res;
      }
    );

    shouldEventuallyOk(mapped, 'ok of 5', done);
  });

  test('returns maped result for mapper with promise of err result return', (done) => {
    const err3 = new Error3();

    async function getAsyncOk(_value: number | string) {
      return Err.of(err3);
    }
    const mapped: Err<Error3> | Err<Error1> | Err<Error2> = result.map(
      async (value: number | string) => {
        const res = await getAsyncOk(value);
        return res;
      }
    );

    shouldEventuallyErr(mapped, err3, done);
  });

  test('returns maped result for mapper with mixed result return', (done) => {
    const err3 = new Error3();

    async function getAsyncOk(value: number | string) {
      return value > 6 ? Err.of(err3) : Ok.of('test-ok' as const);
    }

    const mapped: Result<'test-ok', Error3 | Error1 | Error2> = result.map(
      async (value: number | string) => {
        const res = await getAsyncOk(value);
        return res;
      }
    );

    shouldEventuallyOk(mapped, 'test-ok', done);
  });
});

suite('mapAnyErr', () => {
  type MixedResult<TValue> = Ok<TValue> | Err<Error1> | Err<Error2>;

  const result = Ok.of(5) as Ok<string> | MixedResult<number>;

  test('returns not changed result for Ok result', (done) => {
    const mapped:
      | Ok<number>
      | Ok<string>
      | Err<'test-return'> = result.mapAnyErr((_value: Error1 | Error2) => {
      return 'test-return' as const;
    });

    shouldEventuallyOk(mapped, 5, done);
  });
});

suite('mapErr', () => {
  type MixedResult<TValue> = Ok<TValue> | Err<Error1> | Err<Error2>;

  const result = Ok.of(5) as Ok<string> | MixedResult<number>;

  test('returns not changed result for Ok result', (done) => {
    const mapped:
      | Ok<number>
      | Ok<string>
      | Err<'test-return'>
      | Err<Error1> = result.mapErr(Error2, (_value: Error2) => {
      return 'test-return' as const;
    });

    shouldEventuallyOk(mapped, 5, done);
  });
});
