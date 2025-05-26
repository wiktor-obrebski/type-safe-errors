export { UserCard, MissingPriceError, InvalidCVCError, Product };

interface UserCard {
  number: string;
  cvc: string;
}

interface Product {
  price: number | null;
}

class InvalidCVCError extends Error {
  private __brand!: never;
}

class MissingPriceError extends Error {
  private __brand!: never;
}
