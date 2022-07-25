export { UserCard, MissingPrice, InvalidCVC, Product };

interface UserCard {
  number: string;
  cvc: string;
}

interface Product {
  price: number | null;
}

class InvalidCVC extends Error {
  name = 'InvalidCVC' as const;
}

class MissingPrice extends Error {
  name = 'MissingPrice' as const;
}
