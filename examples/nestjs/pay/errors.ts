export { InvalidCVC, UknownProduct, MissingCardNumber };

class InvalidCVC extends Error {
  name = 'InvalidCVC' as const;
}

class UknownProduct extends Error {
  name = 'UknownProduct' as const;
}

class MissingCardNumber extends Error {
  name = 'MissingCardNumber' as const;
}
