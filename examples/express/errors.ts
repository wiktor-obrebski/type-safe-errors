export { InvalidCVCError, UknownProductError, MissingCardNumberError };

class InvalidCVCError extends Error {
  name = 'InvalidCVCError' as const;
}

class UknownProductError extends Error {
  name = 'UknownProductError' as const;
}

class MissingCardNumberError extends Error {
  name = 'MissingCardNumberError' as const;
}
