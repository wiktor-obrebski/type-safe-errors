import { Result, Ok, Err } from './result';

export { ExtractOkTypes, ExtractErrTypes };

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
