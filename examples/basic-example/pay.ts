import { Err, Ok } from 'type-safe-errors';
import { Product, UserCard, MissingPrice, InvalidCVC } from './types';

export async function payForProduct(card: UserCard, product: Product) {
  // simulate fetching data
  await sleep(10);

  if (!card.cvc) {
    return Err.of(new InvalidCVC());
  }

  if (product.price === null) {
    return Err.of(new MissingPrice());
  }

  // payment logic

  return Ok.of(`Success. Payed ${product.price}`);
}

function sleep(sleepMs: number) {
  return new Promise((resolve) => setTimeout(resolve, sleepMs));
}
