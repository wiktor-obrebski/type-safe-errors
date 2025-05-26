export { InvalidCVCError, UknownProductError, MissingCardNumberError };

class InvalidCVCError extends Error {
  private __brand!: never;
}

class UknownProductError extends Error {
  private __brand!: never;
}

class MissingCardNumberError extends Error {
  private __brand!: never;
}
