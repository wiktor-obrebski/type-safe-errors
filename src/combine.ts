import { Result, Ok, Err } from './result';

export { combine };

function combine<T extends readonly Result<unknown, unknown>[]>(
  results: [...T]
): Result<ExtractOkTypes<T>, ExtractErrTypes<T>[number]> {
  const values = [];
  for (const result of results) {
    if (result.isErr()) {
      return result as any;
    } else if (result.isOk()) {
      values.push(result.value);
    } else {
      throw new Error('Invalid arguments');
    }
  }

  return Ok.of(values) as any;
}

// Given a list of Results, this extracts all the different `T` types from that list
type ExtractOkTypes<T extends readonly Result<unknown, unknown>[]> = {
  [Key in keyof T]: T[Key] extends Result<unknown, unknown>
    ? ExtractOkFromUnion<T[Key]>
    : never;
};

// Given a list of Results, this extracts all the different `E` types from that list
type ExtractErrTypes<T extends readonly Result<unknown, unknown>[]> = {
  [Key in keyof T]: T[Key] extends Result<unknown, unknown>
    ? ExtractErrFromUnion<T[Key]>
    : never;
};

// need to be separated generic type to run it for every element of union T separately
type ExtractOkFromUnion<T extends Result<unknown, unknown>> = T extends Ok<
  infer V
> // filter out "unknown" values
  ? V extends {}
    ? V
    : never
  : never;

// need to be separated generic type to run it for every element of union T separately
type ExtractErrFromUnion<T extends Result<unknown, unknown>> = T extends Err<
  infer E
> // filter out "unknown" values
  ? E extends {}
    ? E
    : never
  : never;
