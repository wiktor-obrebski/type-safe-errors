import { InvalidCVC, MissingCardNumber, UknownProduct } from './errors';
import { Err, Ok } from 'type-safe-errors';

const supportedProductId = '123';
const supportedCVC = '456';

export { payForProduct, getProductPrice };

async function payForProduct(
  cardNumber: string,
  cvc: string,
  productPrice: number
) {
  // simulate fetching data
  await sleep(10);

  if (cvc !== supportedCVC) {
    return Err.of(new InvalidCVC());
  }

  if (!cardNumber) {
    return Err.of(new MissingCardNumber());
  }

  return Ok.of(`Success. Payed ${productPrice}`);
}

async function getProductPrice(productId: string) {
  // simulate fetching data
  await sleep(10);

  return productId === supportedProductId
    ? Ok.of(12.5)
    : Err.of(new UknownProduct());
}

function sleep(sleepMs: number) {
  return new Promise((resolve) => setTimeout(resolve, sleepMs));
}
