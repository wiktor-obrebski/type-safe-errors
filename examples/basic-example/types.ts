export { UserCard, MissingPriceError, InvalidCVCError, Product };

interface UserCard {
  number: string;
  cvc: string;
}

interface Product {
  price: number | null;
}

class InvalidCVCError extends Error {
  name = 'InvalidCVC' as const;
}

class MissingPriceError extends Error {
  name = 'MissingPrice' as const;
}
