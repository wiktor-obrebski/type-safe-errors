export { Result, Ok, Err } from './result';
import type { Result as ResType, Ok as OkType, Err as ErrType } from './result-helpers';

// the types are exported just in case. I think they should not be used directly,
// only as results of `Ok.of`, `Err.of` etc.
export namespace Types {
  export type Result<TValue, TError> = ResType<TValue, TError>;
  export type Ok<TValue> = OkType<TValue>;
  export type Err<TError> = ErrType<TError>;
}
