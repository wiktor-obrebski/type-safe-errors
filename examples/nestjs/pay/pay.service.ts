import { Injectable } from '@nestjs/common';
import { InvalidCVC, UknownProduct, MissingCardNumber } from './errors';
import { Err, Ok } from 'type-safe-errors';

const supportedProductId = '123';
const supportedCVC = '456';

@Injectable()
export class PayService {
  async payForProduct(cardNumber: string, cvc: string, productPrice: number) {
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

  async getProductPrice(productId: string) {
    // simulate fetching data
    await sleep(10);

    return productId === supportedProductId
      ? Ok.of(12.5)
      : Err.of(new UknownProduct());
  }
}

function sleep(sleepMs: number) {
  return new Promise((resolve) => setTimeout(resolve, sleepMs));
}
