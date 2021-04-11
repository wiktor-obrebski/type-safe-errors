import { expect, assert } from 'chai';
import { Result, Ok, Err } from '../index';
import { shouldEventuallyOk, shouldEventuallyErr } from './helper';

class Error1 {
  __brand!: 'Error1';
}

test('Result of an Ok value result promise of the value', async () => {
  const asyncValue: Promise<5> = Ok.of(5 as const).promise();
  const value = await asyncValue;
  expect(value).to.equal(5);
});

test('Result of an Ok value result promise of the value', async () => {
  const err = new Error1();
  const asyncValue: Promise<never> = Err.of(err).promise();
  try {
    await asyncValue;
    assert.fail("the promise should have been rejected already");
  } catch (err) {
    expect(err).to.equal(err);
  }
});

test('Result of an Ok value result promise of the value', async () => {
  const result = Ok.of("test" as const) as Ok<"test"> | Ok<5> | Err<Error1>;
  const asyncValue: Promise<"test"| 5> = result.promise();
    const value = await asyncValue;
  expect(value).to.equal("test");

});
