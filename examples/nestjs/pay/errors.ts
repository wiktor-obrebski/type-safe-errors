export { InvalidCVC, UknownProduct, MissingCardNumber };

class InvalidCVC {
  __brand!: 'InvalidCVC';
}

class UknownProduct {
  __brand!: 'UknownProduct';
}

class MissingCardNumber {
  __brand!: 'MissingCardNumber';
}
