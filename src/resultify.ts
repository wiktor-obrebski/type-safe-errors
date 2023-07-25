import { Result } from './result';

export { resultify };

type Callback<TArgs extends unknown[], TResult> = (...args: TArgs) => TResult;

const resultify =
  <TArgs extends unknown[], TResult>(fn: Callback<TArgs, TResult>) =>
  (...args: TArgs) =>
    Result.from(() => fn(...args));
