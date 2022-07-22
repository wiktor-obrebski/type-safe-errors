export class ResultWrapper<TErrorOrValue>
  implements ResultWrapper<TErrorOrValue>
{
  value: TErrorOrValue;
  isError: boolean;

  constructor(value: TErrorOrValue, isError: boolean) {
    this.value = value;
    this.isError = isError;
  }
}

export interface ResultWrapper<TErrorOrValue> {
  value: TErrorOrValue;
  isError: boolean;
}
