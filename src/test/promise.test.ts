import { expect, assert } from 'chai';
import { Ok, Err } from '../index';

class Error1 extends Error {
  private __brand!: never;
}

test('Result of an Ok value map to a promise of the value', async () => {
  const asyncValue: Promise<5> = Ok.of(5 as const).promise();
  const value = await asyncValue;
  expect(value).to.equal(5);
});

test('Result of an Ok value map to a unsafe promise of the value', async () => {
  const asyncValue: Promise<5> = Ok.of(5 as const).unsafePromise();
  const value = await asyncValue;
  expect(value).to.equal(5);
});

test('Result of an Err value map to an unsafe promise of the value', async () => {
  const err = new Error1();
  const asyncValue: Promise<never> = Err.of(err).unsafePromise();
  try {
    await asyncValue;
    assert.fail('the promise should have been rejected already');
  } catch (err) {
    expect(err).to.equal(err);
  }
});

test('Result of a mixed value map to an unsafe promise of the value', async () => {
  const result = Ok.of('test' as const) as Ok<'test'> | Ok<5> | Err<Error1>;
  const asyncValue: Promise<'test' | 5> = result.unsafePromise();
  const value = await asyncValue;
  expect(value).to.equal('test');
});
