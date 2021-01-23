import { Result, Ok, Err } from './result';
import { combine } from './combine';

// definition of atomic data
class InvalidTest {invalid: 5};
class NotImplementedTest {implement: '5'};

const ok1 = Ok.of('my value1');
const ok2 = Ok.of(2);
const err1 = Err.of(new InvalidTest());
const err2 = Err.of(new NotImplementedTest());

// definition of many kinds of result-related collections that can occur
const arr = [ok1, ok2];
const arrWithErr = [ok1, err1];
const arrWith2Err = [err2, ok1, err1];

const arrOfRes: (Result<string, unknown> | Result<number, unknown>)[] = [
  ok1,
  ok2,
];
const arrayOfResWithErr: (
  | Result<string, unknown>
  | Result<unknown, InvalidTest>
)[] = [ok1, err1];

const tupleOfRes: [Result<string, unknown>, Result<number, unknown>] = [
  ok1,
  ok2,
];
const tupleOfResWithErr: [
  Result<string, unknown>,
  Result<unknown, InvalidTest>
] = [ok1, err1];
const tupleOfResWith2Err: [
  Result<unknown, NotImplementedTest>,
  Result<string, unknown>,
  Result<unknown, InvalidTest>
] = [err2, ok1, err1];

// actual tests
const combinedTupleOk = combine([ok1, ok2]);
// Result<[string, number], [never, never]>

const combinedTupleErr = combine([ok1, err1]);
// Result<[string, never], InvalidTest>

const combinedArrayOk = combine(arr);
// Result<(string | number)[], never>

const combinedArrayErr = combine(arrWithErr);
// Result<string[], InvalidTest>

const combinedArray2Err = combine(arrWith2Err);


const combinedResultsOk = combine(arrOfRes);
// Result<(string | number)[], never>

const combinedResultsErr = combine(arrayOfResWithErr);
// Result<string[], InvalidTest>

const combinedTupleResultsOk = combine(tupleOfRes);
// Result<[string, number], never>

const combinedTupleResultsErr = combine(tupleOfResWithErr);
// Result<[string, never], InvalidTest>

const combinedTupleResultsErr2 = combine(tupleOfResWith2Err);
// Result<[string, never], InvalidTest>
