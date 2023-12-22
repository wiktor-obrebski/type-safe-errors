// aliasing is to re-export types and factory values on same names
import type {
  Result as ResultType,
  Ok as OkType,
  Err as ErrType,
} from './types/result-helpers';

import { Result as ResultVal, Ok as OkVal, Err as ErrVal } from './result';

export { UnknownError } from './common-result';
export { resultify } from './resultify';

export const Result = ResultVal;
export type Result<TValue, TError> = ResultType<TValue, TError>;

export const Ok = OkVal;
export type Ok<TValue> = OkType<TValue>;

export const Err = ErrVal;
export type Err<TError> = ErrType<TError>;
