export { UserCard, MissingPrice, InvalidCVC, Product };

interface UserCard {
  number: string;
  cvc: string;
}

interface Product {
  price: number | null;
}

class InvalidCVC {
  __brand!: 'InvalidCVC';
}

class MissingPrice {
  __brand!: 'MissingPrice';
}
