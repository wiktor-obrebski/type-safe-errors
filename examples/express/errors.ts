export { InvalidCVCError, UknownProductError, MissingCardNumberError };

class InvalidCVCError extends Error {
  name = 'InvalidCVC' as const;
}

class UknownProductError extends Error {
  name = 'UknownProduct' as const;
}

class MissingCardNumberError extends Error {
  name = 'MissingCardNumber' as const;
}
