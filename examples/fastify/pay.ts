import { InvalidCVC, MissingCardNumber, UknownProduct } from './errors';
import { Err, Ok } from 'type-safe-errors';

const supportedProductId = '123';
const supportedCVC = '456';

export { payForProduct, getProductPrice };

function payForProduct(cardNumber: string, cvc: string, productPrice: number) {
  if (cvc !== supportedCVC) {
    return Err.of(new InvalidCVC());
  }

  if (!cardNumber) {
    return Err.of(new MissingCardNumber());
  }

  return Ok.of(`Success. Payed ${productPrice}`);
}

function getProductPrice(productId: string) {
  return productId === supportedProductId
    ? Ok.of(12.5)
    : Err.of(new UknownProduct());
}
