import { Err, Ok } from 'type-safe-errors';
import { Product, UserCard, MissingPrice, InvalidCVC } from './types';

export function payForProduct(card: UserCard, product: Product) {
  if (!card.cvc) {
    return Err.of(new InvalidCVC());
  }

  if (product.price === null) {
    return Err.of(new MissingPrice());
  }

  // payment logic

  return Ok.of(`Success. Payed ${product.price}`);
}
